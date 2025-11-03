import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Home, Search, NotebookPen, User } from "lucide-react";

export function InshoNavbar() {
  return (
    <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-[#1C3024] rounded-full bottom-4 left-1/2">
      <TooltipProvider delayDuration={150}>
        <nav className="grid h-full max-w-lg grid-cols-4 mx-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-full rounded-s-full text-[#96C4A8] hover:text-white hover:bg-transparent"
                aria-label="Home"
              >
                <Home className="size-7 text-[#38E07A]" />
                <span className="sr-only">Home</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-900 text-[#96C4A8] border-0">
              Home
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-full text-[#96C4A8] hover:text-white hover:bg-transparent"
                aria-label="Search"
              >
                <Search className="size-7 text-[#38E07A]" />
                <span className="sr-only">Search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-900 text-[#96C4A8] border-0">
              Search
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-full text-[#96C4A8] hover:text-white hover:bg-transparent"
                aria-label="Log"
              >
                <NotebookPen className="size-7 text-[#38E07A]" />
                <span className="sr-only">Log</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-900 text-[#96C4A8] border-0">
              Log
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-full rounded-e-full text-[#96C4A8] hover:text-white hover:bg-transparent"
                aria-label="Profile"
              >
                <User className="size-7 text-[#38E07A]" />
                <span className="sr-only">Profile</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-900 text-[#96C4A8] border-0">
              Profile
            </TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </div>
  );
}