import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Ajustes del Sitio',
  type: 'document',
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Titular del Hero',
      type: 'string',
      initialValue: 'CREACIÓN DE CONTENIDO AUDIOVISUAL',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Subtítulo del Hero',
      type: 'text',
      rows: 3,
      initialValue:
        '¿Quieres contar algo? Cuéntalo con movimiento. Kaiju TV es especialista en generar contenido audiovisual animado para redes sociales y publicidad online. Mezclamos diseño y animación para crear piezas atractivas con un storytelling directo y eficaz.',
    }),
    defineField({
      name: 'reelVimeoId',
      title: 'ID del Reel en Vimeo (solo el número)',
      type: 'string',
      description: 'Solo el número. Ej: 383493000',
    }),
    defineField({
      name: 'aboutBio',
      title: 'Biografía (Sobre Mí)',
      type: 'text',
      rows: 8,
      initialValue:
        'Mi nombre es Saúl Peña, soy motion grapher y diseñador freelance. Me gradué en Diseño Gráfico y durante el camino descubrí la animación y los motion graphics y me especialicé de manera autodidacta y con formación online. Tengo formación en materias como Marketing Digital, Animación, Modelado 3D, SEO, UI/UX, Edición de vídeo... Soy polivalente y me gusta aprender de todo, y lo sigo haciendo cada día.\n\nMe dedico principalmente a la producción de piezas animadas para difusión online y en TV. Ilustro, animo y hago la postproducción de audio de mis piezas, o bien trabajo en equipo y me especializo en una de esas partes. Soy un canario trabajando desde Madrid, para todo el territorio nacional.',
    }),
    defineField({
      name: 'aboutPhoto',
      title: 'Foto (Sobre Mí)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'aboutStats',
      title: 'Estadísticas (Sobre Mí)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            defineField({ name: 'value', title: 'Valor', type: 'string' }),
            defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
          ],
          preview: {
            select: { value: 'value', label: 'label' },
            prepare: ({ value, label }: { value: string; label: string }) => ({
              title: `${value} — ${label}`,
            }),
          },
        },
      ],
      initialValue: [
        { _type: 'stat', _key: 'years', value: '7', label: 'Años de experiencia' },
        { _type: 'stat', _key: 'clients', value: '36', label: 'Clientes satisfechos' },
        { _type: 'stat', _key: 'projects', value: '+250', label: 'Proyectos acabados' },
      ],
    }),
    defineField({
      name: 'email',
      title: 'Email de contacto',
      type: 'string',
      initialValue: 'info@kaiju-tv.com',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Redes Sociales',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Plataforma',
              type: 'string',
              options: {
                list: [
                  { title: 'Vimeo', value: 'vimeo' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Behance', value: 'behance' },
                  { title: 'Facebook', value: 'facebook' },
                ],
              },
            }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: {
            select: { platform: 'platform', url: 'url' },
            prepare: ({ platform, url }: { platform: string; url: string }) => ({
              title: platform,
              subtitle: url,
            }),
          },
        },
      ],
      initialValue: [
        { _type: 'socialLink', _key: 'vimeo', platform: 'vimeo', url: 'https://vimeo.com/kaijutv' },
        {
          _type: 'socialLink',
          _key: 'instagram',
          platform: 'instagram',
          url: 'https://www.instagram.com/kaijutv/',
        },
        {
          _type: 'socialLink',
          _key: 'behance',
          platform: 'behance',
          url: 'https://www.behance.net/kaijutv',
        },
        {
          _type: 'socialLink',
          _key: 'facebook',
          platform: 'facebook',
          url: 'https://www.facebook.com/Kaiju-Tv-618382831833862/',
        },
      ],
    }),
  ],
});
