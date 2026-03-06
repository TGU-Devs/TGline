import React from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const linkify = (text: string): React.ReactNode[] => {
    const parts = text.split(URL_REGEX);
    return parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-blue-700 break-all"
                >
                    {part}
                </a>
            );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
    });
};
