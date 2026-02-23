import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type ErrorProps = {
    error: string;
    fetch: () => void;
};

const ErrorUI = ({ error, fetch }: ErrorProps) => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">エラーが発生しました</h2>
                <p className="text-muted-foreground mb-6 text-sm">{error}</p>
                <Button onClick={fetch}>再試行</Button>
            </div>
        </div>
    );
};

export default ErrorUI;
