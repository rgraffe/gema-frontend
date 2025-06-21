import { BarChart3, MapPin, UserCircle, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { NavLink, useLocation } from "react-router";

const items = [
  { icon: BarChart3, label: "Vista General", path: "/general" },
  { icon: MapPin, label: "Ubicaciones Técnicas", path: "/locations" },
  { icon: Users, label: "Grupos de Trabajo", path: "/groups" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="flex items-center h-fit">
              <UserCircle size={24} />
              <div className="flex flex-col">
                <span className="text-[1.05rem] font-semibold !text-wrap">
                  Nombre usuario
                </span>
                <span className="text-sm">Coordinador</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <hr className="mt-2 border-neutral-400"></hr>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.path}
              >
                <NavLink to={item.path}>
                  <item.icon className="mr-3" />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
