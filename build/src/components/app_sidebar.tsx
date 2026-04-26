import React from 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                trigger?: string;
                target?: string;
                colors?: string;
                state?: string;
                className?: string;
            };
        }
    }
}

import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarInset,
    SidebarTrigger,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarFooter
} from '@/components/animate-ui/components/radix/sidebar';
import { Settings, LayoutDashboard, User2, LogOut, PencilRuler, FolderOpen } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ThemeTogglerButton } from '@/components/animate-ui/components/buttons/theme-toggler';

export const AppSidebar = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LANDING);
    };

    const isActive = (path: string) => location.pathname === path;

    const getPageName = (pathname: string) => {
        switch (pathname) {
            case ROUTES.HOME: return 'Home';
            case ROUTES.ABOUT: return 'About';
            case ROUTES.DASHBOARD: return 'Dashboard';
            case ROUTES.PROJECTS: return 'Projects';
            case ROUTES.DASHBOARD_SETTINGS: return 'Settings';
            case ROUTES.PROFILE: return 'Profile';
            default:
                if (pathname.startsWith('/editor/')) return 'Editor';
                const segment = pathname.split('/').filter(Boolean).pop();
                if (!segment) return '';
                return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        }
    };

    const navItems = [
        {
            title: 'Home',
            path: ROUTES.HOME,
            icon: (
                <lord-icon
                    src="https://cdn.lordicon.com/oeotfwsx.json"
                    trigger="morph"
                    state="morph-select"
                    target="a"
                    colors="primary:#000000"
                    className="size-5 shrink-0 transition-all duration-300 ease-in-out dark:invert group-data-[collapsible=icon]:size-4"
                />
            )
        },
        {
            title: 'About',
            path: ROUTES.ABOUT,
            icon: (
                <lord-icon
                    src="https://cdn.lordicon.com/juujmrhr.json"
                    trigger="morph"
                    target="a"
                    colors="primary:#000000"
                    className="size-5 shrink-0 transition-all duration-300 ease-in-out dark:invert group-data-[collapsible=icon]:size-4"
                />
            )
        },
        { title: 'Dashboard', path: ROUTES.DASHBOARD, icon: <LayoutDashboard className="size-5 shrink-0" /> },
        {
            title: 'Projects',
            path: ROUTES.PROJECTS,
            icon: <FolderOpen className="size-5 shrink-0" />,
        },
        {
            title: 'Editor',
            path: '/editor/my-project',
            target: '_blank',
            icon: (
                <lord-icon
                    src="https://cdn.lordicon.com/pflszboa.json"
                    trigger="morph"
                    target="a"
                    colors="primary:#000000"
                    className="size-5 shrink-0 transition-all duration-300 ease-in-out dark:invert group-data-[collapsible=icon]:size-4"
                />
            ),
            fallbackIcon: <PencilRuler className="size-5 shrink-0" />,
        },
        { title: 'Settings', path: ROUTES.DASHBOARD_SETTINGS, icon: <Settings className="size-5 shrink-0" /> }
    ];

    return (
        <SidebarProvider>
            <Sidebar variant="inset" collapsible="icon">
                <SidebarHeader>
                    <div className="flex items-center gap-2 p-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                            A
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold text-foreground">Animate App</span>
                            <span className="truncate text-xs text-muted-foreground">v1.0.0</span>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Application</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.path)}>
                                            <Link to={item.path} target={item.target}>
                                                {item.icon}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer">
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-foreground">
                                            <User2 className="size-4" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.name || 'User'}</span>
                                            <span className="truncate text-xs">{user?.email || 'Not signed in'}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" side="top">
                                    <DropdownMenuItem asChild>
                                        <Link to={ROUTES.PROFILE} className="flex items-center gap-2">
                                            <User2 className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={ROUTES.DASHBOARD_SETTINGS} className="flex items-center gap-2">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>

            </Sidebar>


            {/* 
        Main layout content goes here. 
        Note that AppSidebar controls the layout shell, so we wrap {children} in SidebarInset and handle header.
      */}
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 border-b px-4">
                    <div className="flex items-center gap-2 px-1">
                        <SidebarTrigger className="-ml-1" />
                        <span className="font-semibold text-sm">{getPageName(location.pathname)}</span>
                    </div>
                    <ThemeTogglerButton variant="ghost" className="shrink-0" />
                </header>
                <main className="flex flex-1 flex-col overflow-auto bg-background focus:outline-none">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};
