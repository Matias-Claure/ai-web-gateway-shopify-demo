export type ManifestParam = {
  type: "string" | "integer";
  required: boolean;
};

export type ManifestAction = {
  name: string;
  description: string;
  method: "GET" | "POST";
  path: string;
  params: Record<string, ManifestParam>;
  risk: "low" | "medium";
};

export type Manifest = {
  version: string;
  service: string;
  auth: {
    type: "api_key";
    header: string;
  };
  actions: ManifestAction[];
};
