export type CaseType =
    | "upper"
    | "lower"
    | "title"
    | "sentence"
    | "camel"
    | "pascal"
    | "kebab"
    | "snake"
    | "constant"
    | "dot"
    | "path";

function splitWords(input: string): string[] {
    return input
        .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
        .replace(/[_\-./]+/g, " ")
        .toLowerCase()
        .trim()
        .split(/\s+/);
}

export function convertCase(input: string, type: CaseType): string {
    if (!input) return "";

    const words = splitWords(input);

    switch (type) {
        case "upper":
            return words.join(" ").toUpperCase();

        case "lower":
            return words.join(" ").toLowerCase();

        case "title":
            return words
                .map(w => w[0].toUpperCase() + w.slice(1))
                .join(" ");

        case "sentence":
            return words.join(" ").replace(/^./, c => c.toUpperCase());

        case "camel":
            return words
                .map((w, i) =>
                    i === 0 ? w : w[0].toUpperCase() + w.slice(1)
                )
                .join("");

        case "pascal":
            return words
                .map(w => w[0].toUpperCase() + w.slice(1))
                .join("");

        case "kebab":
            return words.join("-");

        case "snake":
            return words.join("_");

        case "constant":
            return words.join("_").toUpperCase();

        case "dot":
            return words.join(".");

        case "path":
            return words.join("/");

        default:
            return input;
    }
}