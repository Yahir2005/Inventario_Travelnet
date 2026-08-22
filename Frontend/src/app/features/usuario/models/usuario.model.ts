export interface Usuario {
    UsuarioId: number,
    Nombre: string,
    Usuario: string,
    Password: string,
    Email: string,
    Telefono: string,
    Active: boolean,
    accesos_count: number;
    ultimo_acceso: string | null;
    Ocupacion: 'Administrador' | 'Instalador' | 'Mostrador';
}