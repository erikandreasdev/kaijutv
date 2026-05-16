import { defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Proyecto',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
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
      name: 'thumbnail',
      title: 'Miniatura',
      type: 'image',
      options: { hotspot: true },
      description: 'Sube aquí el GIF animado o imagen estática del proyecto.',
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'URL de Vimeo',
      type: 'url',
      description: 'Ej: https://vimeo.com/383493000',
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'featured',
      title: 'Destacado en home',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Orden (menor = primero)',
      type: 'number',
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
    prepare({ title, media, featured }: { title: string; media: unknown; featured: boolean }) {
      return { title: featured ? `★ ${title}` : title, media };
    },
  },
});
