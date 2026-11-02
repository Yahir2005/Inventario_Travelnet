export type NombreRol = 'Administrador' | 'Instalador' | 'Mostrador' | 'Cliente';

export interface Rol {
    RolId: number;
    Nombre: NombreRol;
}

export interface Usuario {
    UsuarioId: number;
    RolId?: number;
    Rol?: NombreRol;
    Ocupacion: 'Administrador' | 'Instalador' | 'Mostrador';
    Nombre: string;
    Usuario: string;
    Password?: string;
    Email: string;
    Telefono: string;
    Active: boolean;
    accesos_count: number;
    ultimo_acceso: string | null;
}