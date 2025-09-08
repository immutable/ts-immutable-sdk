import ConfirmationOverlay from './confirmationOverlay';

describe('confirmationOverlay', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should append generic overlay', () => {
    const overlay = new ConfirmationOverlay({}, false);
    overlay.append(() => {}, () => {});
    expect(document.body.innerHTML).toContain('passport-overlay');
  });

  it('should append blocked overlay', () => {
    const overlay = new ConfirmationOverlay({}, true);
    overlay.append(() => {}, () => {});
    expect(document.body.innerHTML).toContain('passport-overlay');
  });

  it('should not append generic overlay when generic disabled', () => {
    const overlay = new ConfirmationOverlay({ disableGenericPopupOverlay: true }, false);
    overlay.append(() => {}, () => {});
    expect(document.body.innerHTML).not.toContain('passport-overlay');
  });

  it('should append overlay if only generic disabled and is blocked', () => {
    const overlay = new ConfirmationOverlay({ disableGenericPopupOverlay: true }, true);
    overlay.append(() => {}, () => {});
    expect(document.body.innerHTML).toContain('passport-overlay');
  });

  it('should not append blocked overlay when blocked disabled', () => {
    const overlay = new ConfirmationOverlay({ disableBlockedPopupOverlay: true }, true);
    overlay.append(() => {}, () => {});
    expect(document.body.innerHTML).not.toContain('passport-overlay');
  });

  it('should append generic overlay when only blocked disabled', () => {
    const overlay = new ConfirmationOverlay({ disableBlockedPopupOverlay: true }, false);
    overlay.append(() => {}, () => {});
    expect(document.body.innerHTML).toContain('passport-overlay');
  });

  it('should not append generic overlay when overlays disabled', () => {
    const overlay = new ConfirmationOverlay({ disableGenericPopupOverlay: true, disableBlockedPopupOverlay: true }, false);
    overlay.append(() => {}, () => {});
    expect(document.body.innerHTML).not.toContain('passport-overlay');
  });

  it('should not append blocked overlay when overlays disabled', () => {
    const overlay = new ConfirmationOverlay({ disableGenericPopupOverlay: true, disableBlockedPopupOverlay: true }, true);
    overlay.append(() => {}, () => {});
    expect(document.body.innerHTML).not.toContain('passport-overlay');
  });
});
