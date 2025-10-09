import EmbeddedLoginPromptOverlay from './embeddedLoginPromptOverlay';
import { PASSPORT_OVERLAY_CONTENTS_ID } from './constants';
import { getEmbeddedLoginPromptOverlay } from './elements';

// Mock dependencies
jest.mock('./elements');

describe('EmbeddedLoginPromptOverlay', () => {
  let mockOverlayHTML: string;
  let mockOverlayDiv: HTMLDivElement;
  let mockOverlayContents: HTMLDivElement;
  let mockIframe: HTMLIFrameElement;
  let mockCloseCallback: jest.Mock;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset static properties
    (EmbeddedLoginPromptOverlay as any).overlay = undefined;
    (EmbeddedLoginPromptOverlay as any).onCloseListener = undefined;
    (EmbeddedLoginPromptOverlay as any).closeButton = undefined;

    // Mock HTML elements
    mockOverlayHTML = '<div id="test-overlay">Test overlay content</div>';
    mockOverlayDiv = {
      innerHTML: '',
      addEventListener: jest.fn(),
      remove: jest.fn(),
    } as unknown as HTMLDivElement;

    mockOverlayContents = {
      appendChild: jest.fn(),
    } as unknown as HTMLDivElement;

    mockIframe = {
      id: 'test-iframe',
    } as HTMLIFrameElement;

    mockCloseCallback = jest.fn();

    // Mock DOM methods
    document.createElement = jest.fn().mockReturnValue(mockOverlayDiv);
    document.body.insertAdjacentElement = jest.fn();
    document.querySelector = jest.fn().mockReturnValue(mockOverlayContents);

    // Mock the getEmbeddedLoginPromptOverlay function
    (getEmbeddedLoginPromptOverlay as jest.Mock).mockReturnValue(mockOverlayHTML);
  });

  describe('remove', () => {
    it('should remove event listener and overlay when they exist', () => {
      const mockCloseButton = {
        removeEventListener: jest.fn(),
      } as unknown as HTMLButtonElement;

      // Set up the static properties as if overlay was created
      (EmbeddedLoginPromptOverlay as any).overlay = mockOverlayDiv;
      (EmbeddedLoginPromptOverlay as any).closeButton = mockCloseButton;
      (EmbeddedLoginPromptOverlay as any).onCloseListener = mockCloseCallback;

      EmbeddedLoginPromptOverlay.remove();

      expect(mockCloseButton.removeEventListener).toHaveBeenCalledWith('click', mockCloseCallback);
      expect(mockOverlayDiv.remove).toHaveBeenCalled();
      expect((EmbeddedLoginPromptOverlay as any).overlay).toBeUndefined();
      expect((EmbeddedLoginPromptOverlay as any).closeButton).toBeUndefined();
      expect((EmbeddedLoginPromptOverlay as any).onCloseListener).toBeUndefined();
    });

    it('should handle removal when overlay does not exist', () => {
      // Ensure overlay is undefined
      (EmbeddedLoginPromptOverlay as any).overlay = undefined;
      (EmbeddedLoginPromptOverlay as any).closeButton = undefined;
      (EmbeddedLoginPromptOverlay as any).onCloseListener = undefined;

      // Should not throw an error
      expect(() => EmbeddedLoginPromptOverlay.remove()).not.toThrow();
    });

    it('should handle removal when close button does not exist but overlay does', () => {
      (EmbeddedLoginPromptOverlay as any).overlay = mockOverlayDiv;
      (EmbeddedLoginPromptOverlay as any).closeButton = undefined;
      (EmbeddedLoginPromptOverlay as any).onCloseListener = mockCloseCallback;

      EmbeddedLoginPromptOverlay.remove();

      expect(mockOverlayDiv.remove).toHaveBeenCalled();
      expect((EmbeddedLoginPromptOverlay as any).overlay).toBeUndefined();
      expect((EmbeddedLoginPromptOverlay as any).closeButton).toBeUndefined();
      expect((EmbeddedLoginPromptOverlay as any).onCloseListener).toBeUndefined();
    });

    it('should handle removal when close listener does not exist', () => {
      const mockCloseButton = {
        removeEventListener: jest.fn(),
      } as unknown as HTMLButtonElement;

      (EmbeddedLoginPromptOverlay as any).overlay = mockOverlayDiv;
      (EmbeddedLoginPromptOverlay as any).closeButton = mockCloseButton;
      (EmbeddedLoginPromptOverlay as any).onCloseListener = undefined;

      EmbeddedLoginPromptOverlay.remove();

      expect(mockCloseButton.removeEventListener).not.toHaveBeenCalled();
      expect(mockOverlayDiv.remove).toHaveBeenCalled();
    });
  });

  describe('appendOverlay', () => {
    it('should create and append overlay when it does not exist', () => {
      EmbeddedLoginPromptOverlay.appendOverlay(mockIframe, mockCloseCallback);

      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockOverlayDiv.innerHTML).toBe(mockOverlayHTML);
      expect(document.body.insertAdjacentElement).toHaveBeenCalledWith('beforeend', mockOverlayDiv);
      expect(document.querySelector).toHaveBeenCalledWith(`#${PASSPORT_OVERLAY_CONTENTS_ID}`);
      expect(mockOverlayContents.appendChild).toHaveBeenCalledWith(mockIframe);
      expect(mockOverlayDiv.addEventListener).toHaveBeenCalledWith('click', mockCloseCallback);
      expect((EmbeddedLoginPromptOverlay as any).overlay).toBe(mockOverlayDiv);
    });

    it('should not create overlay if it already exists', () => {
      // Set overlay as already existing
      (EmbeddedLoginPromptOverlay as any).overlay = mockOverlayDiv;

      EmbeddedLoginPromptOverlay.appendOverlay(mockIframe, mockCloseCallback);

      expect(document.createElement).not.toHaveBeenCalled();
      expect(document.body.insertAdjacentElement).not.toHaveBeenCalled();
      expect(document.querySelector).not.toHaveBeenCalled();
    });

    it('should handle case when overlay contents element is not found', () => {
      (document.querySelector as jest.Mock).mockReturnValue(null);

      EmbeddedLoginPromptOverlay.appendOverlay(mockIframe, mockCloseCallback);

      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockOverlayDiv.innerHTML).toBe(mockOverlayHTML);
      expect(document.body.insertAdjacentElement).toHaveBeenCalledWith('beforeend', mockOverlayDiv);
      expect(document.querySelector).toHaveBeenCalledWith(`#${PASSPORT_OVERLAY_CONTENTS_ID}`);
      // Should not try to append iframe if contents element not found
      expect(mockOverlayContents.appendChild).not.toHaveBeenCalled();
      expect(mockOverlayDiv.addEventListener).toHaveBeenCalledWith('click', mockCloseCallback);
      expect((EmbeddedLoginPromptOverlay as any).overlay).toBe(mockOverlayDiv);
    });

    it('should use getEmbeddedLoginPromptOverlay for overlay HTML', () => {
      EmbeddedLoginPromptOverlay.appendOverlay(mockIframe, mockCloseCallback);

      expect(getEmbeddedLoginPromptOverlay).toHaveBeenCalled();
      expect(mockOverlayDiv.innerHTML).toBe(mockOverlayHTML);
    });

    it('should add click event listener to overlay', () => {
      EmbeddedLoginPromptOverlay.appendOverlay(mockIframe, mockCloseCallback);

      expect(mockOverlayDiv.addEventListener).toHaveBeenCalledWith('click', mockCloseCallback);
    });
  });

  describe('static properties', () => {
    it('should initialize static properties as undefined', () => {
      expect((EmbeddedLoginPromptOverlay as any).overlay).toBeUndefined();
      expect((EmbeddedLoginPromptOverlay as any).onCloseListener).toBeUndefined();
      expect((EmbeddedLoginPromptOverlay as any).closeButton).toBeUndefined();
    });

    it('should maintain overlay reference after creation', () => {
      EmbeddedLoginPromptOverlay.appendOverlay(mockIframe, mockCloseCallback);

      expect((EmbeddedLoginPromptOverlay as any).overlay).toBe(mockOverlayDiv);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete lifecycle: create, use, remove', () => {
      // Create overlay
      EmbeddedLoginPromptOverlay.appendOverlay(mockIframe, mockCloseCallback);

      expect((EmbeddedLoginPromptOverlay as any).overlay).toBe(mockOverlayDiv);
      expect(mockOverlayContents.appendChild).toHaveBeenCalledWith(mockIframe);
      expect(mockOverlayDiv.addEventListener).toHaveBeenCalledWith('click', mockCloseCallback);

      // Remove overlay
      EmbeddedLoginPromptOverlay.remove();

      expect(mockOverlayDiv.remove).toHaveBeenCalled();
      expect((EmbeddedLoginPromptOverlay as any).overlay).toBeUndefined();
    });

    it('should handle multiple append calls without creating multiple overlays', () => {
      const secondIframe = { id: 'second-iframe' } as HTMLIFrameElement;
      const secondCallback = jest.fn();

      // First append
      EmbeddedLoginPromptOverlay.appendOverlay(mockIframe, mockCloseCallback);

      // Reset mocks to track second call
      jest.clearAllMocks();

      // Second append
      EmbeddedLoginPromptOverlay.appendOverlay(secondIframe, secondCallback);

      // Should not create new overlay
      expect(document.createElement).not.toHaveBeenCalled();
      expect(document.body.insertAdjacentElement).not.toHaveBeenCalled();
    });
  });
});
