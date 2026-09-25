/* @ds-bundle: {"format":4,"namespace":"AnindaWidaDesignSystem_d6f5df","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"b41ecfdff67d","components/core/Button.jsx":"48e204f4253a","components/core/Card.jsx":"54d7f96d3ab6","components/core/Input.jsx":"0d7d12d57b1a","components/core/Stat.jsx":"ee35daa63384","components/core/Tag.jsx":"c59d693efd2d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AnindaWidaDesignSystem_d6f5df = window.AnindaWidaDesignSystem_d6f5df || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANT = {
  violet: {
    background: '#F4F1FF',
    color: '#6345E0',
    border: '1px solid #CEBFFF'
  },
  'violet-solid': {
    background: '#7C5CFC',
    color: '#FFFFFF',
    border: '1px solid #7C5CFC'
  },
  cyan: {
    background: '#F0FEFF',
    color: '#007A96',
    border: '1px solid #99F5FF'
  },
  'cyan-solid': {
    background: '#00D4FF',
    color: '#0C0A1E',
    border: '1px solid #00D4FF'
  },
  neutral: {
    background: '#F7F6FF',
    color: '#3B3754',
    border: '1px solid #E5E2F5'
  },
  success: {
    background: '#F0FDF4',
    color: '#15803D',
    border: '1px solid #86EFAC'
  },
  error: {
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FCA5A5'
  },
  warning: {
    background: '#FFFBEB',
    color: '#B45309',
    border: '1px solid #FCD34D'
  }
};
const SIZE = {
  sm: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 600,
    letterSpacing: '0.04em'
  },
  md: {
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 600,
    letterSpacing: '0.03em'
  },
  lg: {
    fontSize: '13px',
    padding: '5px 12px',
    borderRadius: '8px',
    fontWeight: 600
  },
  pill: {
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontWeight: 600
  }
};
function Badge({
  children,
  variant = 'violet',
  size = 'md',
  dot = false,
  style,
  ...props
}) {
  const v = VARIANT[variant] || VARIANT.neutral;
  const s = SIZE[size] || SIZE.md;
  const dotColor = variant === 'success' ? '#16A34A' : variant === 'error' ? '#DC2626' : variant === 'warning' ? '#D97706' : variant.includes('cyan') ? '#00D4FF' : '#7C5CFC';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontFamily: "'JetBrains Mono', monospace",
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...v,
      ...s,
      ...style
    }
  }, props), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: dotColor,
      flexShrink: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 600,
  borderRadius: '8px',
  border: '2px solid transparent',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'color 150ms cubic-bezier(0.22,1,0.36,1), background-color 150ms cubic-bezier(0.22,1,0.36,1), box-shadow 250ms cubic-bezier(0.22,1,0.36,1), transform 150ms cubic-bezier(0.22,1,0.36,1), border-color 150ms cubic-bezier(0.22,1,0.36,1)',
  whiteSpace: 'nowrap',
  lineHeight: 1,
  userSelect: 'none',
  WebkitUserSelect: 'none'
};
const SIZE = {
  sm: {
    padding: '8px 16px',
    fontSize: '13px',
    gap: '6px',
    borderRadius: '6px'
  },
  md: {
    padding: '12px 24px',
    fontSize: '15px',
    gap: '8px',
    borderRadius: '8px'
  },
  lg: {
    padding: '16px 32px',
    fontSize: '17px',
    gap: '10px',
    borderRadius: '10px'
  }
};
const VARIANT_STYLES = {
  primary: {
    background: '#7C5CFC',
    color: '#FFFFFF',
    border: '2px solid #7C5CFC'
  },
  secondary: {
    background: '#00D4FF',
    color: '#0C0A1E',
    border: '2px solid #00D4FF'
  },
  outline: {
    background: 'transparent',
    color: '#7C5CFC',
    border: '2px solid #7C5CFC'
  },
  ghost: {
    background: 'transparent',
    color: '#7C5CFC',
    border: '2px solid transparent'
  },
  neutral: {
    background: '#F0EEFF',
    color: '#3B3754',
    border: '2px solid #E5E2F5'
  },
  danger: {
    background: '#DC2626',
    color: '#FFFFFF',
    border: '2px solid #DC2626'
  }
};
const VARIANT_HOVER = {
  primary: {
    background: '#6345E0',
    borderColor: '#6345E0'
  },
  secondary: {
    background: '#00A3C4',
    borderColor: '#00A3C4'
  },
  outline: {
    background: '#F4F1FF'
  },
  ghost: {
    background: '#F4F1FF'
  },
  neutral: {
    background: '#E5E2F5'
  },
  danger: {
    background: '#B91C1C',
    borderColor: '#B91C1C'
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  href,
  target,
  onClick,
  style,
  ...props
}) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const hoverStyle = hovered && !disabled && !loading ? VARIANT_HOVER[variant] : {};
  const computed = {
    ...BASE,
    ...SIZE[size],
    ...variantStyle,
    ...hoverStyle,
    ...(fullWidth ? {
      width: '100%'
    } : {}),
    ...(disabled || loading ? {
      opacity: 0.45,
      cursor: 'not-allowed',
      pointerEvents: 'none'
    } : {}),
    ...(pressed && !disabled ? {
      transform: 'scale(0.97)'
    } : {}),
    ...(hovered && !disabled && !loading ? {
      boxShadow: variant === 'primary' ? '0 8px 24px rgba(114,41,255,0.28)' : variant === 'secondary' ? '0 8px 24px rgba(0,202,239,0.28)' : 'none'
    } : {}),
    ...style
  };
  const content = /*#__PURE__*/React.createElement(React.Fragment, null, loading && /*#__PURE__*/React.createElement("span", {
    style: {
      width: size === 'sm' ? 12 : size === 'lg' ? 18 : 15,
      height: size === 'sm' ? 12 : size === 'lg' ? 18 : 15,
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'anin-spin 0.7s linear infinite'
    }
  }), children);
  if (href) {
    return /*#__PURE__*/React.createElement("a", _extends({
      href: href,
      target: target,
      style: computed,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => {
        setHovered(false);
        setPressed(false);
      },
      onMouseDown: () => setPressed(true),
      onMouseUp: () => setPressed(false)
    }, props), content);
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `@keyframes anin-spin { to { transform: rotate(360deg); } }`), /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled || loading,
    onClick: onClick,
    style: computed,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false)
  }, props), content));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANT_STYLES = {
  default: {
    background: '#FFFFFF',
    border: '1px solid #E5E2F5',
    boxShadow: '0 2px 8px rgba(114,41,255,0.06)'
  },
  elevated: {
    background: '#FFFFFF',
    border: '1px solid #E5E2F5',
    boxShadow: '0 8px 24px rgba(114,41,255,0.10)'
  },
  tinted: {
    background: '#F0EEFF',
    border: '1px solid #CEBFFF',
    boxShadow: 'none'
  },
  outlined: {
    background: '#FFFFFF',
    border: '2px solid #7C5CFC',
    boxShadow: 'none'
  },
  flat: {
    background: '#F7F6FF',
    border: '1px solid #E5E2F5',
    boxShadow: 'none'
  }
};
const PADDING = {
  none: '0',
  sm: '16px',
  md: '24px',
  lg: '32px'
};
function Card({
  children,
  variant = 'default',
  padding = 'md',
  radius,
  hoverable = false,
  style,
  ...props
}) {
  const [hovered, setHovered] = React.useState(false);
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const r = radius !== undefined ? radius : '8px';
  const hoverStyle = hoverable && hovered ? {
    boxShadow: '0 12px 32px rgba(114,41,255,0.14)',
    transform: 'translateY(-2px)'
  } : {};
  const computed = {
    borderRadius: r,
    padding: PADDING[padding] ?? padding,
    transition: 'box-shadow 250ms cubic-bezier(0.22,1,0.36,1), transform 250ms cubic-bezier(0.22,1,0.36,1)',
    ...variantStyle,
    ...hoverStyle,
    ...style
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: computed,
    onMouseEnter: () => hoverable && setHovered(true),
    onMouseLeave: () => hoverable && setHovered(false)
  }, props), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  size = 'md',
  leading,
  trailing,
  disabled = false,
  style,
  inputStyle,
  id,
  ...props
}) {
  const [focused, setFocused] = React.useState(false);
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const HEIGHT = {
    sm: 36,
    md: 44,
    lg: 52
  };
  const FONT = {
    sm: '13px',
    md: '15px',
    lg: '16px'
  };
  const PX = {
    sm: 10,
    md: 14,
    lg: 16
  };
  const borderColor = error ? '#DC2626' : focused ? '#7C5CFC' : '#E5E2F5';
  const boxShadow = error ? '0 0 0 3px rgba(220,38,38,0.15)' : focused ? '0 0 0 3px rgba(114,41,255,0.18)' : 'none';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '13px',
      fontWeight: 600,
      color: error ? '#DC2626' : '#3B3754',
      letterSpacing: '0.01em'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, leading && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: PX[size],
      color: '#8784A0',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none'
    }
  }, leading), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: '100%',
      height: HEIGHT[size],
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: FONT[size],
      fontWeight: 400,
      color: '#0C0A1E',
      background: disabled ? '#F7F6FF' : '#FFFFFF',
      border: `1.5px solid ${borderColor}`,
      borderRadius: '8px',
      outline: 'none',
      boxShadow,
      paddingLeft: leading ? `${PX[size] + 28}px` : `${PX[size]}px`,
      paddingRight: trailing ? `${PX[size] + 28}px` : `${PX[size]}px`,
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
      ...inputStyle
    }
  }, props)), trailing && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: PX[size],
      color: '#8784A0',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none'
    }
  }, trailing)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
      color: error ? '#DC2626' : '#8784A0',
      fontWeight: error ? 500 : 400
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Stat({
  value,
  label,
  delta,
  deltaLabel,
  accent = 'violet',
  size = 'md',
  style,
  ...props
}) {
  const isPositive = typeof delta === 'string' ? delta.startsWith('+') : typeof delta === 'number' ? delta > 0 : null;
  const isNegative = typeof delta === 'string' ? delta.startsWith('-') || delta.startsWith('−') : typeof delta === 'number' ? delta < 0 : null;
  const accentColor = accent === 'cyan' ? '#00D4FF' : '#7C5CFC';
  const valueSizes = {
    sm: '28px',
    md: '40px',
    lg: '56px'
  };
  const labelSizes = {
    sm: '11px',
    md: '13px',
    lg: '14px'
  };
  const deltaColor = isPositive ? '#16A34A' : isNegative ? '#DC2626' : '#8784A0';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: valueSizes[size] || valueSizes.md,
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1,
      color: accentColor
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: labelSizes[size] || labelSizes.md,
      fontWeight: 500,
      color: '#8784A0',
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, label), (delta !== undefined || deltaLabel) && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
      fontWeight: 600,
      color: deltaColor,
      display: 'flex',
      alignItems: 'center',
      gap: '3px'
    }
  }, delta !== undefined && /*#__PURE__*/React.createElement("span", null, typeof delta === 'number' && delta > 0 ? `+${delta}%` : typeof delta === 'number' ? `${delta}%` : delta), deltaLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#8784A0',
      fontWeight: 400
    }
  }, deltaLabel)));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stat.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const COLOR_MAP = {
  violet: {
    bg: '#F4F1FF',
    text: '#6345E0',
    border: '#CEBFFF'
  },
  cyan: {
    bg: '#F0FEFF',
    text: '#007A96',
    border: '#99F5FF'
  },
  ink: {
    bg: '#F7F6FF',
    text: '#3B3754',
    border: '#E5E2F5'
  },
  success: {
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#86EFAC'
  },
  warning: {
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FCD34D'
  },
  error: {
    bg: '#FEF2F2',
    text: '#DC2626',
    border: '#FCA5A5'
  }
};
function Tag({
  children,
  color = 'ink',
  onRemove,
  style,
  ...props
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.ink;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 10px',
      borderRadius: '4px',
      border: `1px solid ${c.border}`,
      background: c.bg,
      color: c.text,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      ...style
    }
  }, props), children, onRemove && /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      color: 'inherit',
      opacity: 0.6,
      fontSize: '14px',
      lineHeight: 1,
      marginLeft: '2px'
    },
    "aria-label": "Remove tag"
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Tag = __ds_scope.Tag;

})();
