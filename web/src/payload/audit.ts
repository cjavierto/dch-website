/**
 * Activity log: who created, changed, published or deleted what in the
 * admin, and who signed in. Entries are written by hooks added to every
 * collection and global (withAudit), only for signed-in users — the public
 * forms, the seed script and migrations are not logged. Nobody can edit or
 * delete an entry from the admin or the API.
 */
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  Field,
  GlobalAfterChangeHook,
  GlobalConfig,
  PayloadRequest,
} from "payload";

export const AUDIT_SLUG = "audit-log";

const ACTIONS = [
  { label: "Created", value: "create" },
  { label: "Updated", value: "update" },
  { label: "Saved draft", value: "draft" },
  { label: "Published", value: "publish" },
  { label: "Deleted", value: "delete" },
  { label: "Signed in", value: "login" },
  { label: "Signed out", value: "logout" },
] as const;
type Action = (typeof ACTIONS)[number]["value"];

const readOnly = { readOnly: true };

export const AuditLog: CollectionConfig = {
  slug: AUDIT_SLUG,
  labels: { singular: "Activity", plural: "Activity log" },
  admin: {
    group: "Settings",
    useAsTitle: "summary",
    defaultColumns: ["createdAt", "userName", "summary", "changes"],
    listSearchableFields: ["summary", "userName", "userEmail", "documentTitle"],
    description: "Who changed what in the admin, newest first. Entries can't be edited or deleted.",
    pagination: { defaultLimit: 50 },
  },
  defaultSort: "-createdAt",
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "summary", type: "text", required: true, admin: readOnly },
    {
      type: "row",
      fields: [
        { name: "action", type: "select", required: true, options: [...ACTIONS], index: true, admin: readOnly },
        { name: "section", type: "text", admin: { ...readOnly, description: "Collection or page settings." } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "documentTitle", label: "Item", type: "text", admin: readOnly },
        { name: "documentId", label: "Item ID", type: "text", index: true, admin: readOnly },
      ],
    },
    { name: "changes", label: "Fields changed", type: "textarea", admin: readOnly },
    {
      type: "row",
      fields: [
        { name: "user", type: "relationship", relationTo: "users", admin: readOnly },
        { name: "userName", label: "Who", type: "text", admin: readOnly },
        { name: "userEmail", label: "Email", type: "text", admin: readOnly },
      ],
    },
  ],
};

// ---- Writing entries ------------------------------------------------------------

type AuditUser = { id: number | string; email?: string | null; name?: string | null };

async function record(
  req: PayloadRequest,
  entry: { action: Action; section: string; documentTitle?: string; documentId?: string | number; changes?: string[] },
  user: AuditUser | null | undefined = req.user as AuditUser | null,
) {
  // Only people signed in to the admin. Public forms, the seed and migrations have no user.
  if (!user || req.context.skipAudit) return;
  const verb = ACTIONS.find((a) => a.value === entry.action)!.label;
  const item = entry.documentTitle ? ` “${entry.documentTitle}”` : "";
  const summary =
    entry.action === "login" || entry.action === "logout" ? verb : `${verb} ${entry.section}${item}`.slice(0, 250);
  try {
    await req.payload.create({
      collection: AUDIT_SLUG,
      data: {
        summary,
        action: entry.action,
        section: entry.section,
        documentTitle: entry.documentTitle,
        documentId: entry.documentId != null ? String(entry.documentId) : undefined,
        changes: entry.changes?.length ? entry.changes.join(", ") : undefined,
        user: typeof user.id === "number" ? user.id : Number(user.id),
        userName: user.name ?? undefined,
        userEmail: user.email ?? undefined,
      },
      req,
      overrideAccess: true,
    });
  } catch (err) {
    // A failed log entry must never block the editor's save.
    req.payload.logger.error(`Activity log entry failed: ${(err as Error).message}`);
  }
}

// ---- What changed ----------------------------------------------------------------

/** Data fields at the top level, with their admin labels (rows, tabs and
    collapsibles without a name are layout only). */
function namedFields(fields: Field[]): { name: string; label: string }[] {
  const out: { name: string; label: string }[] = [];
  for (const f of fields) {
    if ("name" in f && f.name) {
      const label = "label" in f && typeof f.label === "string" ? f.label : prettify(f.name);
      out.push({ name: f.name, label });
    } else if (f.type === "tabs") {
      for (const tab of f.tabs) {
        if ("name" in tab && tab.name) out.push({ name: tab.name, label: typeof tab.label === "string" ? tab.label : prettify(tab.name) });
        else out.push(...namedFields(tab.fields));
      }
    } else if ("fields" in f) {
      out.push(...namedFields(f.fields));
    }
  }
  return out;
}

const prettify = (name: string) => {
  const words = name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Bookkeeping and upload-derived values that change on their own. */
const IGNORED = new Set(["id", "createdAt", "updatedAt", "_status", "sizes", "url", "thumbnailURL", "sessions", "loginAttempts", "lockUntil"]);

/** Compares related items by id (the saved doc may hold the full item, the
    previous one only its id) and ignores array-row ids. */
const comparable = (v: unknown): string =>
  JSON.stringify(v ?? null, function (key, value) {
    if (value && typeof value === "object" && !Array.isArray(value) && "id" in value && ("createdAt" in value || "updatedAt" in value)) {
      return (value as { id: unknown }).id;
    }
    return key === "id" && !Array.isArray(this) ? undefined : value;
  });

function changedFields(fields: Field[], before: Record<string, unknown> | undefined, after: Record<string, unknown>) {
  if (!before) return [];
  return namedFields(fields)
    .filter((f) => !IGNORED.has(f.name) && comparable(before[f.name]) !== comparable(after[f.name]))
    .map((f) => f.label);
}

const labelOf = (labels: unknown, fallback: string) => {
  if (typeof labels === "string") return labels;
  return prettify(fallback);
};

function titleOf(collection: CollectionConfig, doc: Record<string, unknown>) {
  const key = collection.admin?.useAsTitle;
  const value = (key && doc[key]) || doc.title || doc.name || doc.filename || doc.email;
  return typeof value === "string" ? value.slice(0, 120) : undefined;
}

// ---- Hooks --------------------------------------------------------------------------

function collectionHooks(collection: CollectionConfig) {
  const section = labelOf(collection.labels?.singular, collection.slug);

  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
    const status = doc._status as string | undefined;
    const before = previousDoc?._status as string | undefined;
    let action: Action = operation === "create" ? "create" : "update";
    // Draft-enabled collections: a draft save and a publish are told apart by
    // status. (Saving a draft of a published item, and unpublishing, both
    // show as "Saved draft".)
    if (status === "published" && (operation === "create" || before !== "published")) action = "publish";
    else if (status === "draft") action = "draft";
    await record(req, {
      action,
      section,
      documentTitle: titleOf(collection, doc),
      documentId: doc.id,
      changes: operation === "update" ? changedFields(collection.fields, previousDoc, doc) : undefined,
    });
    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, id, req }) => {
    await record(req, { action: "delete", section, documentTitle: titleOf(collection, doc), documentId: id });
    return doc;
  };

  return { afterChange, afterDelete };
}

function globalHook(global: GlobalConfig): GlobalAfterChangeHook {
  const section = typeof global.label === "string" ? global.label : prettify(global.slug);
  return async ({ doc, previousDoc, req }) => {
    await record(req, { action: "update", section, changes: changedFields(global.fields, previousDoc, doc) });
    return doc;
  };
}

/** Adds activity-log hooks to every collection (and sign-in/out for auth ones). */
export function withAudit(collections: CollectionConfig[]): CollectionConfig[] {
  return collections.map((c) => {
    const { afterChange, afterDelete } = collectionHooks(c);
    const hooks = { ...c.hooks };
    hooks.afterChange = [...(hooks.afterChange ?? []), afterChange];
    hooks.afterDelete = [...(hooks.afterDelete ?? []), afterDelete];
    if (c.auth) {
      hooks.afterLogin = [
        ...(hooks.afterLogin ?? []),
        async ({ req, user }) => {
          await record(req, { action: "login", section: "Admin" }, user as AuditUser);
          return user;
        },
      ];
      hooks.afterLogout = [
        ...(hooks.afterLogout ?? []),
        async ({ req }) => {
          await record(req, { action: "logout", section: "Admin" });
        },
      ];
    }
    return { ...c, hooks };
  });
}

export function withAuditGlobals(globals: GlobalConfig[]): GlobalConfig[] {
  return globals.map((g) => ({
    ...g,
    hooks: { ...g.hooks, afterChange: [...(g.hooks?.afterChange ?? []), globalHook(g)] },
  }));
}
