import {
  formatRatingScore,
  ratingLabels,
  type RatingScoreField,
} from "@/components/features/courses/labels";

function ScoreSummary({ field, value }: { field: RatingScoreField; value: number | null | undefined }) {
  return (
    <div className="rounded-md bg-background p-3">
      <p className="text-xs font-semibold text-muted-foreground">{ratingLabels[field]}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{formatRatingScore(field, value)}</p>
    </div>
  );
}

export default ScoreSummary;
