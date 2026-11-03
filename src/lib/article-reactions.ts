import { z } from "zod";

export const ARTICLE_REACTION_EMOJIS = ["🤩", "🙂", "😐", "🙁", "😡"] as const;

export const ARTICLE_REACTIONS = [
  { emoji: ARTICLE_REACTION_EMOJIS[0], label: "Маш сайн" },
  { emoji: ARTICLE_REACTION_EMOJIS[1], label: "Сайн" },
  { emoji: ARTICLE_REACTION_EMOJIS[2], label: "Дундаж" },
  { emoji: ARTICLE_REACTION_EMOJIS[3], label: "Муу" },
  { emoji: ARTICLE_REACTION_EMOJIS[4], label: "Маш муу" },
] as const;

export type ArticleReactionEmoji = (typeof ARTICLE_REACTIONS)[number]["emoji"];

export const articleReactionSummarySchema = z.object({
  counts: z.record(z.enum(ARTICLE_REACTION_EMOJIS), z.number().int().nonnegative()),
  selected: z.enum(ARTICLE_REACTION_EMOJIS).nullable(),
});
