import { BarChart3, MapPin, Users } from "lucide-react";
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
