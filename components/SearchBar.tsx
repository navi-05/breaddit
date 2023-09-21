"use client";

import axios from "axios";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useRouter, usePathname } from 'next/navigation'
import { useQuery } from "@tanstack/react-query";
import { Prisma, Subreddit } from "@prisma/client";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const router = useRouter()
  const pathName = usePathname()
  const commandRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(commandRef, () => {
    setSearchTerm('')
  })

  useEffect(() => { 
    setSearchTerm('')
  }, [pathName])

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["search-query"],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data } = await axios.get(`/api/search?q=${searchTerm}`);
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[]
    },
    enabled: false,
  });

  const request = debounce(async() => {
    refetch()
  }, 300)
  
  // Debounce
  const debounceRequest = useCallback(() => {
    request()
  }, [])

  return (
    <Command ref={commandRef} className="relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        value={searchTerm}
        onValueChange={(e) => {
          setSearchTerm(e)
          debounceRequest()
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search communities..."
      />

      {searchTerm.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 && (
            <CommandGroup heading="Communities">
              {queryResults?.map((subreddit) => (
                <CommandItem
                  onSelect={(name) => {
                    router.push(`/r/${name}`)
                    router.refresh()
                  }}
                  key={subreddit.id}
                  value={subreddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;
