export interface Usuario {
    UsuarioId: number,
    Nombre: string,
    Usuario: string,
    Password: string,
    Email: string,
    Telefono: string,
    Activo: boolean,
    accesos_count: number;
    ultimo_acceso: string | null;
    ocupacion: 'Administrador' | 'Instalador' | 'Mostrador';
}