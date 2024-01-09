
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Loader } from '../common/loader';

interface SearchProps {
  data: any,
  selectedResult?: any;
  onSelectResult: (product: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  isError: boolean;
  inputPlaceholder?: string;
  noDataMessage?: string
}

export function Search({
  selectedResult,
  onSelectResult,
  searchQuery,
  setSearchQuery,
  data,
  isError,
  isLoading,
  inputPlaceholder,
  noDataMessage
}: SearchProps) {
  const handleSelectResult = (item: any) => {
    onSelectResult(item);

    // OPTIONAL: reset the search query upon selection
    // setSearchQuery('');
  };

  return (
    <Command
      shouldFilter={false}
      className="h-auto rounded-lg border border-b-0 shadow-md"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder={inputPlaceholder}
      />

      <SearchResults
        query={searchQuery}
        selectedResult={selectedResult}
        onSelectResult={handleSelectResult}
        data={data}
        isLoading={isLoading}
        isError={isError}
        noDataMessage={noDataMessage}
      />
    </Command>
  );
}

interface SearchResultsProps {
  query: string;
  selectedResult: SearchProps['selectedResult'];
  onSelectResult: SearchProps['onSelectResult'];
  data: any;
  isLoading: boolean;
  isError: boolean;
  noDataMessage?: string
}

function SearchResults({
  query,
  selectedResult,
  onSelectResult,
  data,
  isLoading: isLoadingOrig,
  isError,
  noDataMessage = 'Nenhum resultado encontrado.'
}: SearchResultsProps) {
  const enabled = !!query;

  const isLoading = enabled && isLoadingOrig;

  if (!enabled) return null;

  const result = data?.pages.map((page: any) => page.result).flat()

  return (
    <CommandList>
      {isLoading && (
        <div className="p-4 text-sm">
          <Loader className='m-0' />
        </div>
      )}

      {!isError && !isLoading && !result?.length && (
        <div className="p-4 text-sm">{noDataMessage}</div>
      )}

      {isError && <div className="p-4 text-sm">Algo deu errado.</div>}

      {result?.map((item: any) => {
        return (
          <CommandItem
            key={item.id}
            onSelect={() => onSelectResult(item)}
            value={item.id}
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                selectedResult?.id === item.id ? 'opacity-100' : 'opacity-0'
              )}
            />
            {item.description}
          </CommandItem>
        );
      })}
    </CommandList>
  );
}