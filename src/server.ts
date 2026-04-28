import { createServer, Model } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    models: {
      document: Model,
    },

    seeds(server) {
      server.create("document", { 
        id: "1", 
        title: "testdoc", 
        pages: ["/docs/1_1.jpg", "/docs/1_2.jpg"] 
      });
      server.create("document", { 
        id: "2", 
        title: "Specimen Printing", 
        pages: ["/docs/2_1.jpg", "/docs/2_2.jpg"] 
      });
      server.create("document", { 
        id: "3", 
        title: "Bauhaus Catalog", 
        pages: ["/docs/3_1.jpg"] 
      });
      server.create("document", { 
        id: "4", 
        title: "Modern Typography", 
        pages: ["/docs/4_1.jpg"] 
      });
      server.create("document", { 
        id: "5", 
        title: "Japanese Stencils", 
        pages: ["/docs/5_1.jpg"] 
      });
    },

    routes() {
      // Указываем пространство имен, чтобы запросы шли на /api/...
      this.namespace = "api";

      // 1. Получение всех документов (для списка в начале)
      this.get("/documents", (schema) => {
        return schema.db.documents;
      });

      // 2. ПОЛУЧЕНИЕ ОДНОГО ДОКУМЕНТА ПО ID (Именно этого роута у вас не хватало)
      // :id — это динамическая часть пути, которую Mirage подставит в request.params.id
      this.get("/documents/:id", (schema, request) => {
        let id = request.params.id;
        return schema.db.documents.find(id);
      });
    },
  });
}