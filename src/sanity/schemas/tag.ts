import { defineField, defineType } from 'sanity';

/**
 * Free-form disciplines a project belongs to: dirección de arte, motion
 * graphics, ilustración, 3D... New tags are created from the Studio, so the
 * list can grow without touching the code.
 */
export const tag = defineType({
  name: 'tag',
  title: 'Etiqueta',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'string',
      description: 'Ej: Dirección de arte, Motion graphics, Ilustración, 3D…',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      description: 'Se usa en el filtro del portfolio. Pulsa "Generate".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden en el filtro (menor = primero)',
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
    select: { title: 'title', order: 'order' },
    prepare: (selection: Record<string, any>) => ({
      title: selection.title,
      subtitle: `Orden: ${selection.order ?? 99}`,
    }),
  },
});
