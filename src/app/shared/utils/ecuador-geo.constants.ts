/* ================================================================
 *  Ecuador — Constantes de geografía: provincias, cantones y sectores
 * ================================================================ */

export interface EcuadorProvince {
    name: string;
    cantons: string[];
}

export const ECUADOR_PROVINCES: EcuadorProvince[] = [
    {
        name: 'Azuay',
        cantons: ['Cuenca', 'Girón', 'Gualaceo', 'Nabón', 'Paute', 'Pucará', 'San Fernando', 'Santa Isabel', 'Sigsig', 'Oña', 'Chordeleg', 'El Pan', 'Sevilla de Oro', 'Guachapala', 'Camilo Ponce Enríquez'],
    },
    {
        name: 'Bolívar',
        cantons: ['Guaranda', 'Caluma', 'Chillanes', 'Chimbo', 'Echeandía', 'Las Naves', 'San Miguel'],
    },
    {
        name: 'Cañar',
        cantons: ['Azogues', 'Biblián', 'Cañar', 'Déleg', 'El Tambo', 'La Troncal', 'Suscal'],
    },
    {
        name: 'Carchi',
        cantons: ['Bolívar', 'Espejo', 'Mira', 'Montúfar', 'San Pedro de Huaca', 'Tulcán'],
    },
    {
        name: 'Chimborazo',
        cantons: ['Riobamba', 'Alausí', 'Chambo', 'Chunchi', 'Colta', 'Cumandá', 'Guamote', 'Guano', 'Pallatanga', 'Penipe', 'Pallatanga'],
    },
    {
        name: 'Cotopaxi',
        cantons: ['Latacunga', 'La Maná', 'Pangua', 'Pujilí', 'Salcedo', 'Saquisilí', 'Sigchos'],
    },
    {
        name: 'El Oro',
        cantons: ['Machala', 'Arenillas', 'Atahualpa', 'Balsas', 'Chilla', 'El Guabo', 'Huaquillas', 'Las Lajas', 'Marcabelí', 'Pasaje', 'Piñas', 'Portovelo', 'Santa Rosa', 'Zaruma'],
    },
    {
        name: 'Esmeraldas',
        cantons: ['Esmeraldas', 'Atacames', 'Eloy Alfaro', 'Muisne', 'Quinindé', 'Rioverde', 'San Lorenzo'],
    },
    {
        name: 'Galápagos',
        cantons: ['San Cristóbal', 'Isabela', 'Santa Cruz'],
    },
    {
        name: 'Guayas',
        cantons: ['Guayaquil', 'Alfredo Baquerizo Moreno', 'Balao', 'Balzar', 'Colimes', 'Coronel Marcelino Maridueña', 'Daule', 'Durán', 'El Empalme', 'El Triunfo', 'General Antonio Elizalde', 'Isidro Ayora', 'Lomas de Sargentillo', 'Milagro', 'Naranjal', 'Naranjito', 'Nobol', 'Palestina', 'Pedro Carbo', 'Playas', 'Salitre', 'Samborondón', 'Santa Lucía', 'Simón Bolívar', 'Yaguachi'],
    },
    {
        name: 'Imbabura',
        cantons: ['Ibarra', 'Antonio Ante', 'Cotacachi', 'Otavalo', 'Pimampiro', 'San Miguel de Urcuquí'],
    },
    {
        name: 'Loja',
        cantons: ['Loja', 'Calvas', 'Catamayo', 'Celica', 'Chaguarpamba', 'Espíndola', 'Gonzanamá', 'Macará', 'Olmedo', 'Paltas', 'Pindal', 'Quilanga', 'Saraguro', 'Sozoranga', 'Zapotillo'],
    },
    {
        name: 'Los Ríos',
        cantons: ['Babahoyo', 'Baba', 'Buena Fe', 'Mocache', 'Montalvo', 'Palenque', 'Pueblo Viejo', 'Quevedo', 'Quinsaloma', 'Urdaneta', 'Valencia', 'Ventanas', 'Vinces'],
    },
    {
        name: 'Manabí',
        cantons: ['Portoviejo', 'Bolívar', 'Chone', 'El Carmen', 'Flavio Alfaro', 'Jama', 'Jaramijó', 'Jipijapa', 'Junín', 'Manta', 'Montecristi', 'Olmedo', 'Paján', 'Pedernales', 'Pichincha', 'Puerto López', 'Rocafuerte', 'San Vicente', 'Santa Ana', 'Sucre', 'Tosagua', '24 de Mayo'],
    },
    {
        name: 'Morona Santiago',
        cantons: ['Morona', 'Gualaquiza', 'Huamboya', 'Limón Indanza', 'Logroño', 'Pablo Sexto', 'Palora', 'San Juan Bosco', 'Santiago', 'Sucúa', 'Taisha', 'Tiwintza'],
    },
    {
        name: 'Napo',
        cantons: ['Tena', 'Archidona', 'Carlos Julio Arosemena Tola', 'El Chaco', 'Quijos'],
    },
    {
        name: 'Orellana',
        cantons: ['Francisco de Orellana', 'Aguarico', 'La Joya de los Sachas', 'Loreto'],
    },
    {
        name: 'Pastaza',
        cantons: ['Pastaza', 'Arajuno', 'Mera', 'Santa Clara'],
    },
    {
        name: 'Pichincha',
        cantons: ['Quito', 'Cayambe', 'Mejía', 'Pedro Moncayo', 'Pedro Vicente Maldonado', 'Puerto Quito', 'Rumiñahui', 'San Miguel de los Bancos'],
    },
    {
        name: 'Santa Elena',
        cantons: ['Santa Elena', 'La Libertad', 'Salinas'],
    },
    {
        name: 'Santo Domingo de los Tsáchilas',
        cantons: ['Santo Domingo', 'La Concordia'],
    },
    {
        name: 'Sucumbíos',
        cantons: ['Nueva Loja', 'Cascales', 'Cuyabeno', 'Gonzalo Pizarro', 'Lago Agrio', 'Putumayo', 'Shushufindi', 'Sucumbíos'],
    },
    {
        name: 'Tungurahua',
        cantons: ['Ambato', 'Baños de Agua Santa', 'Cevallos', 'Mocha', 'Patate', 'Pelileo', 'Píllaro', 'Quero', 'Tisaleo'],
    },
    {
        name: 'Zamora Chinchipe',
        cantons: ['Zamora', 'Centinela del Cóndor', 'Chinchipe', 'El Pangui', 'Nangaritza', 'Palanda', 'Paquisha', 'Yacuambi', 'Yantzaza'],
    },
];

/** Nombres de provincias como array simple */
export const PROVINCE_NAMES: string[] = ECUADOR_PROVINCES.map((p) => p.name);

/** Obtiene los cantones de una provincia */
export function getCantonsForProvince(provinceName: string): string[] {
    return (
        ECUADOR_PROVINCES.find((p) => p.name === provinceName)?.cantons ?? []
    );
}

/** Sectores / zonas urbanas comunes */
export const COMMON_SECTORS: string[] = [
    'Norte',
    'Sur',
    'Centro',
    'Centro Norte',
    'Centro Sur',
    'Este',
    'Oeste',
    'Noreste',
    'Noroeste',
    'Sureste',
    'Suroeste',
    'Valle',
    'Periférico',
    'Zona Industrial',
    'Zona Comercial',
];
