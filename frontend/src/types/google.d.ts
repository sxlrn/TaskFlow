interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: object) => void;
        renderButton: (element: HTMLElement, config: object) => void;
      };
    };
  };
}