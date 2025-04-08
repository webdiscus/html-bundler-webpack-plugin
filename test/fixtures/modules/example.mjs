// Error: [object Module] could not be cloned.
// at serialize (node:v8:386:7)
// export const message = 'Hello from ESM';

// Using loadModuleAsync (load data without cache) the export must be an object.
export default {
  message: 'Hello from ESM',
};
