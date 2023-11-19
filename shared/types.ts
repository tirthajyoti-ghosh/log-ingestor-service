
export type ValidOperators = '=' | '!=' | '~' | '!~';
export type Condition = {
    field: string;
    operator: ValidOperators;
    value: string;
};

export type SearchRequest = Record<string, string> & {
    filters?: Condition[];
    startDate?: string;
    endDate?: string;
    q?: string;
}
