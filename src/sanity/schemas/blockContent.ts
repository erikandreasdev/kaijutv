import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Rich text used for project descriptions.
 * Gives the editor bold, italic, links, lists and small headings — the Studio
 * renders these as a normal toolbar, no HTML knowledge needed.
 */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Texto enriquecido',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Párrafo', value: 'normal' },
        { title: 'Título', value: 'h3' },
        { title: 'Subtítulo', value: 'h4' },
        { title: 'Cita', value: 'blockquote' },
      ],
      lists: [
        { title: 'Lista', value: 'bullet' },
        { title: 'Lista numerada', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Negrita', value: 'strong' },
          { title: 'Cursiva', value: 'em' },
          { title: 'Subrayado', value: 'underline' },
          { title: 'Tachado', value: 'strike-through' },
          { title: 'Código', value: 'code' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Enlace',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (Rule) =>
                  Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }).required(),
              }),
              defineField({
                name: 'blank',
                title: 'Abrir en una pestaña nueva',
                type: 'boolean',
                initialValue: true,
              }),
            ],
          }),
        ],
      },
    }),
  ],
});
