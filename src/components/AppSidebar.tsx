import { BarChart3, LogOut, MapPin, UserCircle, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { NavLink, useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { logout } from "@/services/auth";

const items = [
  { icon: BarChart3, label: "Vista General", path: "/general" },
  { icon: MapPin, label: "Ubicaciones Técnicas", path: "/ubicaciones-tecnicas" },
  { icon: Users, label: "Grupos de Trabajo", path: "/grupos" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Usuario";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center h-fit">
                <UserCircle size={24} />
                <div className="flex flex-col">
                  <span className="text-[1.05rem] font-semibold !text-wrap">
                    {username}
                  </span>
                  <span className="text-sm">Coordinador</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <hr className="border-neutral-400 mb-2"></hr>
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
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate("/iniciar-sesion");
                }}
              >
                <LogOut size={5} className="text-neutral-600" />
                <span className="text-neutral-600">Cerrar sesión</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
