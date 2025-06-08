import { useState, useEffect, memo } from 'react';
import { Search, Filter, X, Calendar, Star, TrendingUp, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { debounce } from '@/utils';
import { useMovieGenres } from '@/hooks/useMovies';
import type { Genre } from '@/lib/api/types';

export interface FilterState {
  query: string;
  genres: number[];
  yearFrom: number | null;
  yearTo: number | null;
  ratingFrom: number;
  ratingTo: number;
  sortBy: string;
  includeAdult: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  isLoading?: boolean;
  resultsCount?: number;
}

export const FilterPanel = memo(({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false,
  resultsCount = 0,
}: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(filters.query);
  const { data: genresData } = useMovieGenres();

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    onFiltersChange({ ...filters, query });
  }, 300);

  useEffect(() => {
    debouncedSearch(localQuery);
  }, [localQuery, debouncedSearch]);

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 60 }, (_, i) => currentYear - i);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'vote_average.asc', label: 'Lowest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'original_title.asc', label: 'A-Z' },
    { value: 'original_title.desc', label: 'Z-A' },
  ];

  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const handleYearChange = (type: 'from' | 'to', value: string) => {
    const year = value ? parseInt(value) : null;
    onFiltersChange({
      ...filters,
      [type === 'from' ? 'yearFrom' : 'yearTo']: year,
    });
  };

  const handleRatingChange = (type: 'from' | 'to', value: number) => {
    onFiltersChange({
      ...filters,
      [type === 'from' ? 'ratingFrom' : 'ratingTo']: value,
    });
  };

  const activeFiltersCount = 
    filters.genres.length +
    (filters.yearFrom ? 1 : 0) +
    (filters.yearTo ? 1 : 0) +
    (filters.ratingFrom > 0 ? 1 : 0) +
    (filters.ratingTo < 10 ? 1 : 0) +
    (filters.sortBy !== 'popularity.desc' ? 1 : 0);

  return (
    <Card className="p-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for movies..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Filter Toggle & Results */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>

        <div className="flex items-center space-x-4">
          {resultsCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {resultsCount.toLocaleString()} results
            </span>
          )}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-6">
          {/* Sort By */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Genres */}
          <div>
            <label className="text-sm font-medium mb-2 block">Genres</label>
            {genresData?.genres ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {genresData.genres.map((genre) => (
                  <Button
                    key={genre.id}
                    variant={filters.genres.includes(genre.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGenreToggle(genre.id)}
                    className="justify-start text-xs"
                  >
                    {genre.name}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading genres...</div>
            )}
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From Year</label>
              <select
                value={filters.yearFrom || ''}
                onChange={(e) => handleYearChange('from', e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Any</option>
                {yearRange.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Year</label>
              <select
                value={filters.yearTo || ''}
                onChange={(e) => handleYearChange('to', e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Any</option>
                {yearRange.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Rating Range: {filters.ratingFrom} - {filters.ratingTo}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Minimum</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.ratingFrom}
                  onChange={(e) => handleRatingChange('from', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Maximum</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filters.ratingTo}
                  onChange={(e) => handleRatingChange('to', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
});

FilterPanel.displayName = 'FilterPanel';
