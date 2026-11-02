export interface Usuario {
    UsuarioId: number;
    RolId?: number;
    Rol?: 'Administrador' | 'Instalador' | 'Mostrador' | 'Cliente';
    Nombre: string;
    Usuario: string;
    Password: string;
    Email: string;
    Telefono: string;
    Active?: boolean;
    Activo: boolean;
    accesos_count: number;
    ultimo_acceso: string | null;
    Ocupacion?: 'Administrador' | 'Instalador' | 'Mostrador';
    ocupacion: 'Administrador' | 'Instalador' | 'Mostrador';
}