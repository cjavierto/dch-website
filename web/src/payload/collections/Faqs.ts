import type { CollectionConfig } from "payload";
import { sortField } from "../fields";
import { revalidateCollection } from "../revalidate";

export const Faqs: CollectionConfig = {
  slug: "faqs",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: { group: "Content", useAsTitle: "question", defaultColumns: ["question", "sort"] },
  defaultSort: "sort",
  hooks: revalidateCollection("faqs"),
  fields: [
    { name: "question", type: "text", required: true },
    {
      name: "answer",
      type: "textarea",
      required: true,
      admin: { description: "Use {emergencyNumber} or {trunkline} to insert the numbers from Website settings." },
    },
    sortField,
  ],
};
