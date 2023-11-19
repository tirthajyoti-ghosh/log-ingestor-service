import { SearchRequest } from '../shared/types';
import { FilterStrategy, dateRangeFilterStrategy, conditionsFilterStrategy } from './filter-strategies';

type FilterBuilder = {
    (requestBody: SearchRequest): Record<string, any>;
}

export const filterBuilder: FilterBuilder = (requestBody) => {
    const applyStrategies = (...strategies: FilterStrategy[]) => (initialConditions: Record<string, any>) =>
        strategies.reduce((conditions, strategy) => {
            const strategyConditions = strategy(requestBody);
            
            return {
                ...conditions,
                ...strategyConditions,
            };
        }, initialConditions);

    const applyAdditionalFilters = (initialConditions: Record<string, any>) =>
        Object.keys(requestBody).reduce(
            (conditions, key) =>
                key !== 'q' && key !== 'startDate' && key !== 'endDate' && key !== 'filters'
                    ? {
                        ...conditions,
                        [key]: { $regex: requestBody[key], $options: 'i' },
                    }
                    : conditions,
            initialConditions
        );

    return applyAdditionalFilters(
        applyStrategies(dateRangeFilterStrategy, conditionsFilterStrategy)({})
    );
};
