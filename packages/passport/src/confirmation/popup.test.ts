/*
 * @jest-environment jsdom
 */
import { openPopupCenter, PopUpProps } from './popup';

describe('openPopupCenter', () => {
  let windowSpy: jest.SpyInstance;
  const mockPopup = {
    focus: jest.fn(),
    screen: {},
  };
  const mockWindow = {
    screenX: 100,
    screenY: 200,
    outerWidth: 1200,
    outerHeight: 800,
    open: jest.fn().mockReturnValue(mockPopup),
  } as unknown as Window;

  beforeEach(() => {
    jest.clearAllMocks();
    windowSpy = jest.spyOn(global, 'window', 'get');
    windowSpy.mockImplementation(() => mockWindow);
  });

  it('should open a new window with correct dimensions', () => {
    const props: PopUpProps = {
      url: 'https://www.example.com',
      title: 'Example Popup',
      width: 800,
      height: 600,
    };

    const result = openPopupCenter(props);

    expect(result).toEqual(mockPopup);
    expect(mockWindow.open).toHaveBeenCalledWith(
      'https://www.example.com',
      'Example Popup',
      expect.any(String),
    );
    expect(mockPopup.focus).toHaveBeenCalledTimes(1);
    const screenArgs = (mockWindow.open as jest.Mock).mock.calls[0][2];
    expect(screenArgs.includes('width=800')).toBeTruthy();
    expect(screenArgs.includes('height=600')).toBeTruthy();
    expect(screenArgs.includes('left=300')).toBeTruthy();
    expect(screenArgs.includes('top=300')).toBeTruthy();
  });

  it('should throw an error if the new window fails to open', () => {
    (mockWindow.open as jest.Mock).mockImplementationOnce(() => null);

    expect(() => openPopupCenter({
      url: 'https://www.example.com',
      title: 'Example Popup',
      width: 800,
      height: 600,
    })).toThrow('Failed to open confirmation screen');
  });
});
