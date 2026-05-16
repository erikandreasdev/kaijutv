import { defineField, defineType } from 'sanity';

export const service = defineType({
  name: 'service',
  title: 'Servicio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icono',
      type: 'image',
      description: 'Icono PNG del servicio.',
    }),
    defineField({
      name: 'order',
      title: 'Orden (menor = primero)',
      type: 'number',
      initialValue: 1,
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
    select: { title: 'title', order: 'order' },
    prepare: ({ title, order }: { title: string; order: number }) => ({
      title: `${order}. ${title}`,
    }),
  },
});
