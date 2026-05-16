import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/services/api";

interface ActorAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function ActorAutocomplete({
    value,
    onChange,
    placeholder = "Select actor...",
    className,
}: ActorAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [actors, setActors] = React.useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (open) {
                fetchActors(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, open]);

    const fetchActors = async (query: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/actors?search=${query}&limit=10`);
            setActors(response.data.actors || []);
        } catch (error) {
            console.error("Failed to fetch actors", error);
            setActors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (currentValue: string) => {
        onChange(currentValue);
        setOpen(false);
        setSearchTerm("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "justify-between bg-secondary/30 border-none hover:bg-secondary/50 font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search actor..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        {loading && (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!loading && (
                            <>
                                {actors.length === 0 && searchTerm && (
                                    <CommandEmpty className="py-2 text-sm text-center">
                                        <button
                                            className="flex items-center justify-center w-full gap-2 p-2 hover:bg-secondary/20 text-accent transition-colors"
                                            onClick={() => handleSelect(searchTerm)}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create "{searchTerm}"
                                        </button>
                                    </CommandEmpty>
                                )}
                                <CommandGroup>
                                    {actors.map((actor) => (
                                        <CommandItem
                                            key={actor.id}
                                            value={actor.name}
                                            onSelect={handleSelect}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === actor.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {actor.name}
                                        </CommandItem>
                                    ))}
                                    {/* Allow creating if search term doesn't match exactly any existing actor */}
                                    {searchTerm && !actors.some(a => a.name.toLowerCase() === searchTerm.toLowerCase()) && (
                                        <CommandItem
                                            value={searchTerm}
                                            onSelect={() => handleSelect(searchTerm)}
                                            className="text-accent"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create "{searchTerm}"
                                        </CommandItem>
                                    )}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
