import { defineArrayMember, defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Proyecto',
  type: 'document',
  groups: [
    { name: 'content', title: 'Contenido', default: true },
    { name: 'media', title: 'Galería' },
    { name: 'settings', title: 'Ajustes' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Motion Graphics', value: 'motion-graphics' },
          { title: 'Branding', value: 'branding' },
          { title: 'Explainer Video', value: 'explainer-video' },
          { title: 'Contenido RRSS', value: 'contenido-rrss' },
          { title: 'Publicidad Online', value: 'publicidad-online' },
          { title: 'Broadcast Design', value: 'broadcast-design' },
          { title: 'Brand Video', value: 'brand-video' },
          { title: 'Otro', value: 'otro' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Etiquetas / disciplinas',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'tag' }] })],
      description:
        'Dirección de arte, motion graphics, ilustración… Se usan para filtrar el portfolio. Crea las que necesites en “Etiquetas”.',
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'client',
      title: 'Cliente',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Descripción',
      type: 'blockContent',
      group: 'content',
      description:
        'Admite negrita, cursiva, subrayado, listas, citas y enlaces desde la barra de herramientas.',
    }),
    defineField({
      name: 'description',
      title: 'Descripción (formato antiguo)',
      type: 'text',
      rows: 4,
      group: 'content',
      readOnly: true,
      // Only surfaces on documents created before the rich-text migration, so
      // the old copy can be pasted across and the field then disappears.
      hidden: ({ document }) => !document?.description,
      description:
        'Texto plano heredado. Cópialo al campo “Descripción” de arriba y bórralo de aquí; entonces este campo desaparecerá.',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Miniatura',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      description: 'Sube aquí el GIF animado o imagen estática del proyecto.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Describe la imagen para accesibilidad y SEO.',
        }),
      ],
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'URL de Vimeo (vídeo principal)',
      type: 'url',
      group: 'media',
      description: 'Ej: https://vimeo.com/383493000',
    }),
    defineField({
      name: 'gallery',
      title: 'Galería (imágenes y vídeos)',
      type: 'array',
      group: 'media',
      options: { layout: 'grid' },
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Pie de foto',
              type: 'string',
            }),
            defineField({
              name: 'wide',
              title: 'Ocupar todo el ancho',
              type: 'boolean',
              description: 'Actívalo para que esta imagen ocupe la fila completa.',
              initialValue: false,
            }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'vimeoItem',
          title: 'Vídeo Vimeo',
          fields: [
            defineField({
              name: 'vimeoUrl',
              title: 'URL de Vimeo',
              type: 'url',
              description: 'Ej: https://vimeo.com/383493000',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { url: 'vimeoUrl' },
            prepare: (selection: Record<string, any>) => ({
              title: '▶ Vídeo Vimeo',
              subtitle: selection.url,
            }),
          },
        }),
      ],
      description:
        'Arrastra varias imágenes a la vez desde tu carpeta (o pulsa “Add item” → “Image” → puedes seleccionar múltiples archivos). Se suben directamente a Sanity, no hace falta ningún servicio externo. Al pulsar en una foto en la web se abre a pantalla completa.',
    }),
    defineField({
      name: 'featured',
      title: 'Destacado en home',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Orden (menor = primero)',
      type: 'number',
      group: 'settings',
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: 'Orden manual',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', media: 'thumbnail', featured: 'featured' },
    prepare: (selection: Record<string, any>) => ({
      title: selection.featured ? `★ ${selection.title}` : selection.title,
      media: selection.media,
    }),
  },
});
