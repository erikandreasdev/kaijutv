import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { media } from 'sanity-plugin-media';
import { schemaTypes } from './src/sanity/schemas';

export default defineConfig({
  name: 'kaijutv',
  title: 'Kaiju TV',
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenido')
          .items([
            S.listItem()
              .title('Ajustes del sitio')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),
            S.documentTypeListItem('project').title('Proyectos'),
            S.documentTypeListItem('tag').title('Etiquetas'),
            S.documentTypeListItem('service').title('Servicios'),
          ]),
    }),
    // Media library: bulk upload, search and reuse of every asset in the project.
    media(),
  ],
  schema: {
    types: schemaTypes,
  },
});
