'use client';

import { Search as SearchIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search } from './search';

const POPOVER_WIDTH = 'w-full';

type ComboboxProps = {
  selected: any;
  setSelected: (selected: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  data: any;
  isLoading: boolean;
  isError: boolean;
  comboboxPlaceholder?: string;
  inputPlaceholder?: string;
}

export function Combobox({
  selected,
  setSelected,
  searchQuery,
  setSearchQuery,
  data,
  isLoading,
  isError,
  comboboxPlaceholder = 'Selecionar item',
  inputPlaceholder = 'Pesquisar item...',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleSetActive = React.useCallback((item: any) => {
    setSelected(item);

    // OPTIONAL: close the combobox upon selection
    // setOpen(false);
  }, [setSelected]);

  const displayName = selected ? selected.description : comboboxPlaceholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('justify-between', POPOVER_WIDTH)}
        >
          {displayName}

          <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" className={cn('p-0 border-0', POPOVER_WIDTH)}>
        <Search
          selectedResult={selected}
          onSelectResult={handleSetActive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          data={data}
          isLoading={isLoading}
          isError={isError}
          inputPlaceholder={inputPlaceholder}
          noDataMessage='Nenhum item encontrado.'
        />
      </PopoverContent>
    </Popover>
  );
}