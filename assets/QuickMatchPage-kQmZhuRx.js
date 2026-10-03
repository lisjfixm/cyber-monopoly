import { a5 as axiosForBackend, r as reactExports, j as jsxRuntimeExports, a6 as Primitive, a7 as useComposedRefs, a8 as Anchor, a9 as composeEventHandlers, aa as useLayoutEffect2, ab as Portal, ac as Presence, ad as useId, ae as reactDomExports, af as useControllableState, ag as Root2, ah as createPopperScope, ai as useCallbackRef, aj as hideOthers, ak as useFocusGuards, al as ReactRemoveScroll, am as FocusScope, an as DismissableLayer, ao as createContextScope, ap as createSlot, aq as Content, ar as Arrow, f as ChevronDown, as as cn, at as Check, C as ChevronUp, au as Dialog, av as DialogContent, aw as DialogHeader, ax as DialogTitle, ay as Flag, az as DialogDescription, aA as DialogFooter, u as useNavigate, a as usePlayerIdentity, m as useAudio, l as logger, v as MODE_LABELS, Z as Zap, U as Users, aB as Clock } from "./index-Clt-7orM.js";
import { R as REPORT_REASONS, s as submitReport, b as blockPlayer, i as isBlocked } from "./report-block-iWBcCh-Q.js";
import { u as useDirection, c as createCollection } from "./index-rUpIA8Ly.js";
import { U as UserX } from "./user-x-B2GWbvQo.js";
import { A as ArrowLeft } from "./arrow-left-Bad1l0sv.js";
import { H as Hash } from "./hash-B1uqFUlW.js";
async function request(url, method, data, params) {
  const response = await axiosForBackend({
    url,
    method,
    data,
    params
  });
  const result = response.data;
  if (result.code !== 0) {
    throw new Error(result.message || "请求失败");
  }
  return result.data;
}
const matchmakingApi = {
  joinMatch: (params) => request("/api/matchmaking/join", "POST", params),
  leaveMatch: (visitorId) => request("/api/matchmaking/leave", "POST", {
    visitorId
  }),
  getMatchStatus: (visitorId) => request("/api/matchmaking/status", "GET", void 0, {
    visitorId
  })
};
function clamp(value, [min, max]) {
  return Math.min(max, Math.max(min, value));
}
function usePrevious(value) {
  const ref = reactExports.useRef({ value, previous: value });
  return reactExports.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}
var VISUALLY_HIDDEN_STYLES = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal"
});
var NAME = "VisuallyHidden";
var VisuallyHidden = reactExports.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        ...props,
        ref: forwardedRef,
        style: { ...VISUALLY_HIDDEN_STYLES, ...props.style }
      }
    );
  }
);
VisuallyHidden.displayName = NAME;
var OPEN_KEYS = [" ", "Enter", "ArrowUp", "ArrowDown"];
var SELECTION_KEYS = [" ", "Enter"];
var SELECT_NAME = "Select";
var [Collection, useCollection, createCollectionScope] = createCollection(SELECT_NAME);
var [createSelectContext] = createContextScope(SELECT_NAME, [
  createCollectionScope,
  createPopperScope
]);
var usePopperScope = createPopperScope();
var [SelectProviderImpl, useSelectContext] = createSelectContext(SELECT_NAME);
var [SelectNativeOptionsProvider, useSelectNativeOptionsContext] = createSelectContext(SELECT_NAME);
var PROVIDER_NAME = "SelectProvider";
function SelectProvider(props) {
  const {
    __scopeSelect,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    value: valueProp,
    defaultValue,
    onValueChange,
    dir,
    name,
    autoComplete,
    disabled,
    required,
    form,
    // @ts-expect-error internal render prop used by `Select` to compose its default parts
    internal_do_not_use_render
  } = props;
  const popperScope = usePopperScope(__scopeSelect);
  const [trigger, setTrigger] = reactExports.useState(null);
  const [valueNode, setValueNode] = reactExports.useState(null);
  const [valueNodeHasChildren, setValueNodeHasChildren] = reactExports.useState(false);
  const direction = useDirection(dir);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: SELECT_NAME
  });
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
    caller: SELECT_NAME
  });
  const triggerPointerDownPosRef = reactExports.useRef(null);
  const isFormControl = trigger ? !!form || !!trigger.closest("form") : true;
  const [nativeOptionsSet, setNativeOptionsSet] = reactExports.useState(/* @__PURE__ */ new Set());
  const contentId = useId();
  const nativeSelectKey = Array.from(nativeOptionsSet).map((option) => option.props.value).join(";");
  const handleNativeOptionAdd = reactExports.useCallback((option) => {
    setNativeOptionsSet((prev) => new Set(prev).add(option));
  }, []);
  const handleNativeOptionRemove = reactExports.useCallback((option) => {
    setNativeOptionsSet((prev) => {
      const optionsSet = new Set(prev);
      optionsSet.delete(option);
      return optionsSet;
    });
  }, []);
  const context = {
    required,
    trigger,
    onTriggerChange: setTrigger,
    valueNode,
    onValueNodeChange: setValueNode,
    valueNodeHasChildren,
    onValueNodeHasChildrenChange: setValueNodeHasChildren,
    contentId,
    value,
    onValueChange: setValue,
    open,
    onOpenChange: setOpen,
    dir: direction,
    triggerPointerDownPosRef,
    disabled,
    name,
    autoComplete,
    form,
    nativeOptions: nativeOptionsSet,
    nativeSelectKey,
    isFormControl
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectProviderImpl, { scope: __scopeSelect, ...context, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: __scopeSelect, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectNativeOptionsProvider,
    {
      scope: __scopeSelect,
      onNativeOptionAdd: handleNativeOptionAdd,
      onNativeOptionRemove: handleNativeOptionRemove,
      children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
    }
  ) }) }) });
}
SelectProvider.displayName = PROVIDER_NAME;
var Select$1 = (props) => {
  const { __scopeSelect, children, ...providerProps } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectProvider,
    {
      __scopeSelect,
      ...providerProps,
      internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        children,
        isFormControl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectBubbleInput,
          {
            __scopeSelect
          }
        ) : null
      ] })
    }
  );
};
Select$1.displayName = SELECT_NAME;
var TRIGGER_NAME = "SelectTrigger";
var SelectTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, disabled = false, ...triggerProps } = props;
    const popperScope = usePopperScope(__scopeSelect);
    const context = useSelectContext(TRIGGER_NAME, __scopeSelect);
    const isDisabled = context.disabled || disabled;
    const composedRefs = useComposedRefs(forwardedRef, context.onTriggerChange);
    const getItems = useCollection(__scopeSelect);
    const pointerTypeRef = reactExports.useRef("touch");
    const [searchRef, handleTypeaheadSearch, resetTypeahead] = useTypeaheadSearch((search) => {
      const enabledItems = getItems().filter((item) => !item.disabled);
      const currentItem = enabledItems.find((item) => item.value === context.value);
      const nextItem = findNextItem(enabledItems, search, currentItem);
      if (nextItem !== void 0) {
        context.onValueChange(nextItem.value);
      }
    });
    const handleOpen = (pointerEvent) => {
      if (!isDisabled) {
        context.onOpenChange(true);
        resetTypeahead();
      }
      if (pointerEvent) {
        context.triggerPointerDownPosRef.current = {
          x: Math.round(pointerEvent.pageX),
          y: Math.round(pointerEvent.pageY)
        };
      }
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "combobox",
        "aria-controls": context.open ? context.contentId : void 0,
        "aria-expanded": context.open,
        "aria-required": context.required,
        "aria-autocomplete": "none",
        dir: context.dir,
        "data-state": context.open ? "open" : "closed",
        disabled: isDisabled,
        "data-disabled": isDisabled ? "" : void 0,
        "data-placeholder": shouldShowPlaceholder(context.value) ? "" : void 0,
        ...triggerProps,
        ref: composedRefs,
        onClick: composeEventHandlers(triggerProps.onClick, (event) => {
          event.currentTarget.focus();
          if (pointerTypeRef.current !== "mouse") {
            handleOpen(event);
          }
        }),
        onPointerDown: composeEventHandlers(triggerProps.onPointerDown, (event) => {
          pointerTypeRef.current = event.pointerType;
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
          }
          if (event.button === 0 && event.ctrlKey === false && event.pointerType === "mouse") {
            handleOpen(event);
            event.preventDefault();
          }
        }),
        onKeyDown: composeEventHandlers(triggerProps.onKeyDown, (event) => {
          const isTypingAhead = searchRef.current !== "";
          const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
          if (!isModifierKey && event.key.length === 1) handleTypeaheadSearch(event.key);
          if (isTypingAhead && event.key === " ") return;
          if (OPEN_KEYS.includes(event.key)) {
            handleOpen();
            event.preventDefault();
          }
        })
      }
    ) });
  }
);
SelectTrigger$1.displayName = TRIGGER_NAME;
var VALUE_NAME = "SelectValue";
var SelectValue$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, className, style, children, placeholder = "", ...valueProps } = props;
    const context = useSelectContext(VALUE_NAME, __scopeSelect);
    const { onValueNodeHasChildrenChange } = context;
    const hasChildren = children !== void 0;
    const composedRefs = useComposedRefs(forwardedRef, context.onValueNodeChange);
    useLayoutEffect2(() => {
      onValueNodeHasChildrenChange(hasChildren);
    }, [onValueNodeHasChildrenChange, hasChildren]);
    const showPlaceholder = shouldShowPlaceholder(context.value);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        ...valueProps,
        asChild: showPlaceholder ? false : valueProps.asChild,
        ref: composedRefs,
        style: { pointerEvents: "none" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: showPlaceholder ? placeholder : children }, showPlaceholder ? "placeholder" : "value")
      }
    );
  }
);
SelectValue$1.displayName = VALUE_NAME;
var ICON_NAME = "SelectIcon";
var SelectIcon = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, children, ...iconProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { "aria-hidden": true, ...iconProps, ref: forwardedRef, children: children || "▼" });
  }
);
SelectIcon.displayName = ICON_NAME;
var PORTAL_NAME = "SelectPortal";
var [PortalProvider, usePortalContext] = createSelectContext(PORTAL_NAME, {
  forceMount: void 0
});
var SelectPortal = (props) => {
  const { __scopeSelect, forceMount, ...portalProps } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: props.__scopeSelect, forceMount, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { asChild: true, ...portalProps }) });
};
SelectPortal.displayName = PORTAL_NAME;
var CONTENT_NAME = "SelectContent";
var SelectContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeSelect);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useSelectContext(CONTENT_NAME, props.__scopeSelect);
    const [fragment, setFragment] = reactExports.useState();
    useLayoutEffect2(() => {
      setFragment(new DocumentFragment());
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: ({ present }) => present ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContentImpl, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContentFragment, { ...contentProps, fragment }) });
  }
);
SelectContent$1.displayName = CONTENT_NAME;
var SelectContentFragment = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeSelect, children, fragment } = props;
  if (!fragment) return null;
  return reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContentProvider, { scope: __scopeSelect, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: __scopeSelect, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: forwardedRef, children }) }) }),
    fragment
  );
});
SelectContentFragment.displayName = "SelectContentFragment";
var CONTENT_MARGIN = 10;
var [SelectContentProvider, useSelectContentContext] = createSelectContext(CONTENT_NAME);
var CONTENT_IMPL_NAME = "SelectContentImpl";
var Slot = createSlot("SelectContent.RemoveScroll");
var SelectContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect } = props;
    const {
      position = "item-aligned",
      onCloseAutoFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      //
      // PopperContent props
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      avoidCollisions,
      //
      ...contentProps
    } = props;
    const context = useSelectContext(CONTENT_NAME, __scopeSelect);
    const [content, setContent] = reactExports.useState(null);
    const [viewport, setViewport] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
    const [selectedItem, setSelectedItem] = reactExports.useState(null);
    const [selectedItemText, setSelectedItemText] = reactExports.useState(
      null
    );
    const getItems = useCollection(__scopeSelect);
    const [isPositioned, setIsPositioned] = reactExports.useState(false);
    const firstValidItemFoundRef = reactExports.useRef(false);
    reactExports.useEffect(() => {
      if (content) return hideOthers(content);
    }, [content]);
    useFocusGuards();
    const focusFirst = reactExports.useCallback(
      (candidates) => {
        const [firstItem, ...restItems] = getItems().map((item) => item.ref.current);
        const [lastItem] = restItems.slice(-1);
        const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
        for (const candidate of candidates) {
          if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
          candidate?.scrollIntoView({ block: "nearest" });
          if (candidate === firstItem && viewport) viewport.scrollTop = 0;
          if (candidate === lastItem && viewport) viewport.scrollTop = viewport.scrollHeight;
          candidate?.focus();
          if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
        }
      },
      [getItems, viewport]
    );
    const focusSelectedItem = reactExports.useCallback(
      () => focusFirst([selectedItem, content]),
      [focusFirst, selectedItem, content]
    );
    reactExports.useEffect(() => {
      if (isPositioned) {
        focusSelectedItem();
      }
    }, [isPositioned, focusSelectedItem]);
    const { onOpenChange, triggerPointerDownPosRef } = context;
    reactExports.useEffect(() => {
      if (content) {
        let pointerMoveDelta = { x: 0, y: 0 };
        const handlePointerMove = (event) => {
          pointerMoveDelta = {
            x: Math.abs(Math.round(event.pageX) - (triggerPointerDownPosRef.current?.x ?? 0)),
            y: Math.abs(Math.round(event.pageY) - (triggerPointerDownPosRef.current?.y ?? 0))
          };
        };
        const handlePointerUp = (event) => {
          if (pointerMoveDelta.x <= 10 && pointerMoveDelta.y <= 10) {
            event.preventDefault();
          } else {
            if (!event.composedPath().includes(content)) {
              onOpenChange(false);
            }
          }
          document.removeEventListener("pointermove", handlePointerMove);
          triggerPointerDownPosRef.current = null;
        };
        if (triggerPointerDownPosRef.current !== null) {
          document.addEventListener("pointermove", handlePointerMove);
          document.addEventListener("pointerup", handlePointerUp, { capture: true, once: true });
        }
        return () => {
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerUp, { capture: true });
        };
      }
    }, [content, onOpenChange, triggerPointerDownPosRef]);
    reactExports.useEffect(() => {
      const close = () => onOpenChange(false);
      window.addEventListener("blur", close);
      window.addEventListener("resize", close);
      return () => {
        window.removeEventListener("blur", close);
        window.removeEventListener("resize", close);
      };
    }, [onOpenChange]);
    const [searchRef, handleTypeaheadSearch] = useTypeaheadSearch((search) => {
      const enabledItems = getItems().filter((item) => !item.disabled);
      const currentItem = enabledItems.find((item) => item.ref.current === document.activeElement);
      const nextItem = findNextItem(enabledItems, search, currentItem);
      if (nextItem) {
        setTimeout(() => nextItem.ref.current.focus());
      }
    });
    const itemRefCallback = reactExports.useCallback(
      (node, value, disabled) => {
        const isFirstValidItem = !firstValidItemFoundRef.current && !disabled;
        const isSelectedItem = context.value !== void 0 && context.value === value;
        if (isSelectedItem || isFirstValidItem) {
          setSelectedItem(node);
          if (isFirstValidItem) firstValidItemFoundRef.current = true;
        }
      },
      [context.value]
    );
    const handleItemLeave = reactExports.useCallback(() => content?.focus(), [content]);
    const itemTextRefCallback = reactExports.useCallback(
      (node, value, disabled) => {
        const isFirstValidItem = !firstValidItemFoundRef.current && !disabled;
        const isSelectedItem = context.value !== void 0 && context.value === value;
        if (isSelectedItem || isFirstValidItem) {
          setSelectedItemText(node);
        }
      },
      [context.value]
    );
    const SelectPosition = position === "popper" ? SelectPopperPosition : SelectItemAlignedPosition;
    const popperContentProps = SelectPosition === SelectPopperPosition ? {
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      avoidCollisions
    } : {};
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SelectContentProvider,
      {
        scope: __scopeSelect,
        content,
        viewport,
        onViewportChange: setViewport,
        itemRefCallback,
        selectedItem,
        onItemLeave: handleItemLeave,
        itemTextRefCallback,
        focusSelectedItem,
        selectedItemText,
        position,
        isPositioned,
        searchRef,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          FocusScope,
          {
            asChild: true,
            trapped: context.open,
            onMountAutoFocus: (event) => {
              event.preventDefault();
            },
            onUnmountAutoFocus: composeEventHandlers(onCloseAutoFocus, (event) => {
              context.trigger?.focus({ preventScroll: true });
              event.preventDefault();
            }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              DismissableLayer,
              {
                asChild: true,
                disableOutsidePointerEvents: true,
                onEscapeKeyDown,
                onPointerDownOutside,
                onFocusOutside: (event) => event.preventDefault(),
                onDismiss: () => context.onOpenChange(false),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectPosition,
                  {
                    role: "listbox",
                    id: context.contentId,
                    "data-state": context.open ? "open" : "closed",
                    dir: context.dir,
                    onContextMenu: (event) => event.preventDefault(),
                    ...contentProps,
                    ...popperContentProps,
                    onPlaced: () => setIsPositioned(true),
                    ref: composedRefs,
                    style: {
                      // flex layout so we can place the scroll buttons properly
                      display: "flex",
                      flexDirection: "column",
                      // reset the outline by default as the content MAY get focused
                      outline: "none",
                      ...contentProps.style
                    },
                    onKeyDown: composeEventHandlers(contentProps.onKeyDown, (event) => {
                      const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
                      if (event.key === "Tab") event.preventDefault();
                      if (!isModifierKey && event.key.length === 1) handleTypeaheadSearch(event.key);
                      if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
                        const items = getItems().filter((item) => !item.disabled);
                        let candidateNodes = items.map((item) => item.ref.current);
                        if (["ArrowUp", "End"].includes(event.key)) {
                          candidateNodes = candidateNodes.slice().reverse();
                        }
                        if (["ArrowUp", "ArrowDown"].includes(event.key)) {
                          const currentElement = event.target;
                          const currentIndex = candidateNodes.indexOf(currentElement);
                          candidateNodes = candidateNodes.slice(currentIndex + 1);
                        }
                        setTimeout(() => focusFirst(candidateNodes));
                        event.preventDefault();
                      }
                    })
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
SelectContentImpl.displayName = CONTENT_IMPL_NAME;
var ITEM_ALIGNED_POSITION_NAME = "SelectItemAlignedPosition";
var SelectItemAlignedPosition = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeSelect, onPlaced, ...popperProps } = props;
  const context = useSelectContext(CONTENT_NAME, __scopeSelect);
  const contentContext = useSelectContentContext(CONTENT_NAME, __scopeSelect);
  const [contentWrapper, setContentWrapper] = reactExports.useState(null);
  const [content, setContent] = reactExports.useState(null);
  const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
  const getItems = useCollection(__scopeSelect);
  const shouldExpandOnScrollRef = reactExports.useRef(false);
  const shouldRepositionRef = reactExports.useRef(true);
  const { viewport, selectedItem, selectedItemText, focusSelectedItem } = contentContext;
  const position = reactExports.useCallback(() => {
    if (context.trigger && context.valueNode && contentWrapper && content && viewport && selectedItem && selectedItemText) {
      const triggerRect = context.trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const valueNodeRect = context.valueNode.getBoundingClientRect();
      const itemTextRect = selectedItemText.getBoundingClientRect();
      if (context.dir !== "rtl") {
        const itemTextOffset = itemTextRect.left - contentRect.left;
        const left = valueNodeRect.left - itemTextOffset;
        const leftDelta = triggerRect.left - left;
        const minContentWidth = triggerRect.width + leftDelta;
        const contentWidth = Math.max(minContentWidth, contentRect.width);
        const rightEdge = window.innerWidth - CONTENT_MARGIN;
        const clampedLeft = clamp(left, [
          CONTENT_MARGIN,
          // Prevents the content from going off the starting edge of the
          // viewport. It may still go off the ending edge, but this can be
          // controlled by the user since they may want to manage overflow in a
          // specific way.
          // https://github.com/radix-ui/primitives/issues/2049
          Math.max(CONTENT_MARGIN, rightEdge - contentWidth)
        ]);
        contentWrapper.style.minWidth = minContentWidth + "px";
        contentWrapper.style.left = clampedLeft + "px";
      } else {
        const itemTextOffset = contentRect.right - itemTextRect.right;
        const right = window.innerWidth - valueNodeRect.right - itemTextOffset;
        const rightDelta = window.innerWidth - triggerRect.right - right;
        const minContentWidth = triggerRect.width + rightDelta;
        const contentWidth = Math.max(minContentWidth, contentRect.width);
        const leftEdge = window.innerWidth - CONTENT_MARGIN;
        const clampedRight = clamp(right, [
          CONTENT_MARGIN,
          Math.max(CONTENT_MARGIN, leftEdge - contentWidth)
        ]);
        contentWrapper.style.minWidth = minContentWidth + "px";
        contentWrapper.style.right = clampedRight + "px";
      }
      const items = getItems();
      const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
      const itemsHeight = viewport.scrollHeight;
      const contentStyles = window.getComputedStyle(content);
      const contentBorderTopWidth = parseInt(contentStyles.borderTopWidth, 10);
      const contentPaddingTop = parseInt(contentStyles.paddingTop, 10);
      const contentBorderBottomWidth = parseInt(contentStyles.borderBottomWidth, 10);
      const contentPaddingBottom = parseInt(contentStyles.paddingBottom, 10);
      const fullContentHeight = contentBorderTopWidth + contentPaddingTop + itemsHeight + contentPaddingBottom + contentBorderBottomWidth;
      const minContentHeight = Math.min(selectedItem.offsetHeight * 5, fullContentHeight);
      const viewportStyles = window.getComputedStyle(viewport);
      const viewportPaddingTop = parseInt(viewportStyles.paddingTop, 10);
      const viewportPaddingBottom = parseInt(viewportStyles.paddingBottom, 10);
      const topEdgeToTriggerMiddle = triggerRect.top + triggerRect.height / 2 - CONTENT_MARGIN;
      const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;
      const selectedItemHalfHeight = selectedItem.offsetHeight / 2;
      const itemOffsetMiddle = selectedItem.offsetTop + selectedItemHalfHeight;
      const contentTopToItemMiddle = contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle;
      const itemMiddleToContentBottom = fullContentHeight - contentTopToItemMiddle;
      const willAlignWithoutTopOverflow = contentTopToItemMiddle <= topEdgeToTriggerMiddle;
      if (willAlignWithoutTopOverflow) {
        const isLastItem = items.length > 0 && selectedItem === items[items.length - 1].ref.current;
        contentWrapper.style.bottom = "0px";
        const viewportOffsetBottom = content.clientHeight - viewport.offsetTop - viewport.offsetHeight;
        const clampedTriggerMiddleToBottomEdge = Math.max(
          triggerMiddleToBottomEdge,
          selectedItemHalfHeight + // viewport might have padding bottom, include it to avoid a scrollable viewport
          (isLastItem ? viewportPaddingBottom : 0) + viewportOffsetBottom + contentBorderBottomWidth
        );
        const height = contentTopToItemMiddle + clampedTriggerMiddleToBottomEdge;
        contentWrapper.style.height = height + "px";
      } else {
        const isFirstItem = items.length > 0 && selectedItem === items[0].ref.current;
        contentWrapper.style.top = "0px";
        const clampedTopEdgeToTriggerMiddle = Math.max(
          topEdgeToTriggerMiddle,
          contentBorderTopWidth + viewport.offsetTop + // viewport might have padding top, include it to avoid a scrollable viewport
          (isFirstItem ? viewportPaddingTop : 0) + selectedItemHalfHeight
        );
        const height = clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom;
        contentWrapper.style.height = height + "px";
        viewport.scrollTop = contentTopToItemMiddle - topEdgeToTriggerMiddle + viewport.offsetTop;
      }
      contentWrapper.style.margin = `${CONTENT_MARGIN}px 0`;
      contentWrapper.style.minHeight = minContentHeight + "px";
      contentWrapper.style.maxHeight = availableHeight + "px";
      onPlaced?.();
      requestAnimationFrame(() => shouldExpandOnScrollRef.current = true);
    }
  }, [
    getItems,
    context.trigger,
    context.valueNode,
    contentWrapper,
    content,
    viewport,
    selectedItem,
    selectedItemText,
    context.dir,
    onPlaced
  ]);
  useLayoutEffect2(() => position(), [position]);
  const [contentZIndex, setContentZIndex] = reactExports.useState();
  useLayoutEffect2(() => {
    if (content) setContentZIndex(window.getComputedStyle(content).zIndex);
  }, [content]);
  const handleScrollButtonChange = reactExports.useCallback(
    (node) => {
      if (node && shouldRepositionRef.current === true) {
        position();
        focusSelectedItem?.();
        shouldRepositionRef.current = false;
      }
    },
    [position, focusSelectedItem]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectViewportProvider,
    {
      scope: __scopeSelect,
      contentWrapper,
      shouldExpandOnScrollRef,
      onScrollButtonChange: handleScrollButtonChange,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          ref: setContentWrapper,
          style: {
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            zIndex: contentZIndex
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Primitive.div,
            {
              ...popperProps,
              ref: composedRefs,
              style: {
                // When we get the height of the content, it includes borders. If we were to set
                // the height without having `boxSizing: 'border-box'` it would be too big.
                boxSizing: "border-box",
                // We need to ensure the content doesn't get taller than the wrapper
                maxHeight: "100%",
                ...popperProps.style
              }
            }
          )
        }
      )
    }
  );
});
SelectItemAlignedPosition.displayName = ITEM_ALIGNED_POSITION_NAME;
var POPPER_POSITION_NAME = "SelectPopperPosition";
var SelectPopperPosition = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeSelect,
    align = "start",
    collisionPadding = CONTENT_MARGIN,
    ...popperProps
  } = props;
  const popperScope = usePopperScope(__scopeSelect);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content,
    {
      ...popperScope,
      ...popperProps,
      ref: forwardedRef,
      align,
      collisionPadding,
      style: {
        // Ensure border-box for floating-ui calculations
        boxSizing: "border-box",
        ...popperProps.style,
        // re-namespace exposed content custom properties
        ...{
          "--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-select-content-available-width": "var(--radix-popper-available-width)",
          "--radix-select-content-available-height": "var(--radix-popper-available-height)",
          "--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    }
  );
});
SelectPopperPosition.displayName = POPPER_POSITION_NAME;
var [SelectViewportProvider, useSelectViewportContext] = createSelectContext(CONTENT_NAME, {});
var VIEWPORT_NAME = "SelectViewport";
var SelectViewport = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, nonce, ...viewportProps } = props;
    const contentContext = useSelectContentContext(VIEWPORT_NAME, __scopeSelect);
    const viewportContext = useSelectViewportContext(VIEWPORT_NAME, __scopeSelect);
    const composedRefs = useComposedRefs(forwardedRef, contentContext.onViewportChange);
    const prevScrollTopRef = reactExports.useRef(0);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}`
          },
          nonce
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: __scopeSelect, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          "data-radix-select-viewport": "",
          role: "presentation",
          ...viewportProps,
          ref: composedRefs,
          style: {
            // we use position: 'relative' here on the `viewport` so that when we call
            // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
            // (independent of the scrollUpButton).
            position: "relative",
            flex: 1,
            // Viewport should only be scrollable in the vertical direction.
            // This won't work in vertical writing modes, so we'll need to
            // revisit this if/when that is supported
            // https://developer.chrome.com/blog/vertical-form-controls
            overflow: "hidden auto",
            ...viewportProps.style
          },
          onScroll: composeEventHandlers(viewportProps.onScroll, (event) => {
            const viewport = event.currentTarget;
            const { contentWrapper, shouldExpandOnScrollRef } = viewportContext;
            if (shouldExpandOnScrollRef?.current && contentWrapper) {
              const scrolledBy = Math.abs(prevScrollTopRef.current - viewport.scrollTop);
              if (scrolledBy > 0) {
                const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
                const cssMinHeight = parseFloat(contentWrapper.style.minHeight);
                const cssHeight = parseFloat(contentWrapper.style.height);
                const prevHeight = Math.max(cssMinHeight, cssHeight);
                if (prevHeight < availableHeight) {
                  const nextHeight = prevHeight + scrolledBy;
                  const clampedNextHeight = Math.min(availableHeight, nextHeight);
                  const heightDiff = nextHeight - clampedNextHeight;
                  contentWrapper.style.height = clampedNextHeight + "px";
                  if (contentWrapper.style.bottom === "0px") {
                    viewport.scrollTop = heightDiff > 0 ? heightDiff : 0;
                    contentWrapper.style.justifyContent = "flex-end";
                  }
                }
              }
            }
            prevScrollTopRef.current = viewport.scrollTop;
          })
        }
      ) })
    ] });
  }
);
SelectViewport.displayName = VIEWPORT_NAME;
var GROUP_NAME = "SelectGroup";
var [SelectGroupContextProvider, useSelectGroupContext] = createSelectContext(GROUP_NAME);
var SelectGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...groupProps } = props;
    const groupId = useId();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectGroupContextProvider, { scope: __scopeSelect, id: groupId, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { role: "group", "aria-labelledby": groupId, ...groupProps, ref: forwardedRef }) });
  }
);
SelectGroup.displayName = GROUP_NAME;
var LABEL_NAME = "SelectLabel";
var SelectLabel = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...labelProps } = props;
    const groupContext = useSelectGroupContext(LABEL_NAME, __scopeSelect);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { id: groupContext.id, ...labelProps, ref: forwardedRef });
  }
);
SelectLabel.displayName = LABEL_NAME;
var ITEM_NAME = "SelectItem";
var [SelectItemContextProvider, useSelectItemContext] = createSelectContext(ITEM_NAME);
var SelectItem$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSelect,
      value,
      disabled = false,
      textValue: textValueProp,
      ...itemProps
    } = props;
    const context = useSelectContext(ITEM_NAME, __scopeSelect);
    const contentContext = useSelectContentContext(ITEM_NAME, __scopeSelect);
    const isSelected = context.value === value;
    const [textValue, setTextValue] = reactExports.useState(textValueProp ?? "");
    const [isFocused, setIsFocused] = reactExports.useState(false);
    const composedRefs = useComposedRefs(
      forwardedRef,
      (node) => contentContext.itemRefCallback?.(node, value, disabled)
    );
    const textId = useId();
    const pointerTypeRef = reactExports.useRef("touch");
    const handleSelect = () => {
      if (!disabled) {
        context.onValueChange(value);
        context.onOpenChange(false);
      }
    };
    if (value === "") {
      throw new Error(
        "A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder."
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SelectItemContextProvider,
      {
        scope: __scopeSelect,
        value,
        disabled,
        textId,
        isSelected,
        onItemTextChange: reactExports.useCallback((node) => {
          setTextValue((prevTextValue) => prevTextValue || (node?.textContent ?? "").trim());
        }, []),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Collection.ItemSlot,
          {
            scope: __scopeSelect,
            value,
            disabled,
            textValue,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Primitive.div,
              {
                role: "option",
                "aria-labelledby": textId,
                "data-highlighted": isFocused ? "" : void 0,
                "aria-selected": isSelected && isFocused,
                "data-state": isSelected ? "checked" : "unchecked",
                "aria-disabled": disabled || void 0,
                "data-disabled": disabled ? "" : void 0,
                tabIndex: disabled ? void 0 : -1,
                ...itemProps,
                ref: composedRefs,
                onFocus: composeEventHandlers(itemProps.onFocus, () => setIsFocused(true)),
                onBlur: composeEventHandlers(itemProps.onBlur, () => setIsFocused(false)),
                onClick: composeEventHandlers(itemProps.onClick, () => {
                  if (pointerTypeRef.current !== "mouse") handleSelect();
                }),
                onPointerUp: composeEventHandlers(itemProps.onPointerUp, () => {
                  if (pointerTypeRef.current === "mouse") handleSelect();
                }),
                onPointerDown: composeEventHandlers(itemProps.onPointerDown, (event) => {
                  pointerTypeRef.current = event.pointerType;
                }),
                onPointerMove: composeEventHandlers(itemProps.onPointerMove, (event) => {
                  pointerTypeRef.current = event.pointerType;
                  if (disabled) {
                    contentContext.onItemLeave?.();
                  } else if (pointerTypeRef.current === "mouse") {
                    event.currentTarget.focus({ preventScroll: true });
                  }
                }),
                onPointerLeave: composeEventHandlers(itemProps.onPointerLeave, (event) => {
                  if (event.currentTarget === document.activeElement) {
                    contentContext.onItemLeave?.();
                  }
                }),
                onKeyDown: composeEventHandlers(itemProps.onKeyDown, (event) => {
                  const isTypingAhead = contentContext.searchRef?.current !== "";
                  if (isTypingAhead && event.key === " ") return;
                  if (SELECTION_KEYS.includes(event.key)) handleSelect();
                  if (event.key === " ") event.preventDefault();
                })
              }
            )
          }
        )
      }
    );
  }
);
SelectItem$1.displayName = ITEM_NAME;
var ITEM_TEXT_NAME = "SelectItemText";
var SelectItemText = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, className, style, ...itemTextProps } = props;
    const context = useSelectContext(ITEM_TEXT_NAME, __scopeSelect);
    const contentContext = useSelectContentContext(ITEM_TEXT_NAME, __scopeSelect);
    const itemContext = useSelectItemContext(ITEM_TEXT_NAME, __scopeSelect);
    const nativeOptionsContext = useSelectNativeOptionsContext(ITEM_TEXT_NAME, __scopeSelect);
    const [itemTextNode, setItemTextNode] = reactExports.useState(null);
    const composedRefs = useComposedRefs(
      forwardedRef,
      (node) => setItemTextNode(node),
      itemContext.onItemTextChange,
      (node) => contentContext.itemTextRefCallback?.(node, itemContext.value, itemContext.disabled)
    );
    const textContent = itemTextNode?.textContent;
    const nativeOption = reactExports.useMemo(
      () => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: itemContext.value, disabled: itemContext.disabled, children: textContent }, itemContext.value),
      [itemContext.disabled, itemContext.value, textContent]
    );
    const { onNativeOptionAdd, onNativeOptionRemove } = nativeOptionsContext;
    useLayoutEffect2(() => {
      onNativeOptionAdd(nativeOption);
      return () => onNativeOptionRemove(nativeOption);
    }, [onNativeOptionAdd, onNativeOptionRemove, nativeOption]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { id: itemContext.textId, ...itemTextProps, ref: composedRefs }),
      itemContext.isSelected && context.valueNode && !context.valueNodeHasChildren ? reactDomExports.createPortal(itemTextProps.children, context.valueNode) : null
    ] });
  }
);
SelectItemText.displayName = ITEM_TEXT_NAME;
var ITEM_INDICATOR_NAME = "SelectItemIndicator";
var SelectItemIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...itemIndicatorProps } = props;
    const itemContext = useSelectItemContext(ITEM_INDICATOR_NAME, __scopeSelect);
    return itemContext.isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { "aria-hidden": true, ...itemIndicatorProps, ref: forwardedRef }) : null;
  }
);
SelectItemIndicator.displayName = ITEM_INDICATOR_NAME;
var SCROLL_UP_BUTTON_NAME = "SelectScrollUpButton";
var SelectScrollUpButton$1 = reactExports.forwardRef((props, forwardedRef) => {
  const contentContext = useSelectContentContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect);
  const viewportContext = useSelectViewportContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect);
  const [canScrollUp, setCanScrollUp] = reactExports.useState(false);
  const composedRefs = useComposedRefs(forwardedRef, viewportContext.onScrollButtonChange);
  useLayoutEffect2(() => {
    if (contentContext.viewport && contentContext.isPositioned) {
      let handleScroll2 = function() {
        const canScrollUp2 = viewport.scrollTop > 0;
        setCanScrollUp(canScrollUp2);
      };
      const viewport = contentContext.viewport;
      handleScroll2();
      viewport.addEventListener("scroll", handleScroll2);
      return () => viewport.removeEventListener("scroll", handleScroll2);
    }
  }, [contentContext.viewport, contentContext.isPositioned]);
  return canScrollUp ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectScrollButtonImpl,
    {
      ...props,
      ref: composedRefs,
      onAutoScroll: () => {
        const { viewport, selectedItem } = contentContext;
        if (viewport && selectedItem) {
          viewport.scrollTop = viewport.scrollTop - selectedItem.offsetHeight;
        }
      }
    }
  ) : null;
});
SelectScrollUpButton$1.displayName = SCROLL_UP_BUTTON_NAME;
var SCROLL_DOWN_BUTTON_NAME = "SelectScrollDownButton";
var SelectScrollDownButton$1 = reactExports.forwardRef((props, forwardedRef) => {
  const contentContext = useSelectContentContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect);
  const viewportContext = useSelectViewportContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect);
  const [canScrollDown, setCanScrollDown] = reactExports.useState(false);
  const composedRefs = useComposedRefs(forwardedRef, viewportContext.onScrollButtonChange);
  useLayoutEffect2(() => {
    if (contentContext.viewport && contentContext.isPositioned) {
      let handleScroll2 = function() {
        const maxScroll = viewport.scrollHeight - viewport.clientHeight;
        const canScrollDown2 = Math.ceil(viewport.scrollTop) < maxScroll;
        setCanScrollDown(canScrollDown2);
      };
      const viewport = contentContext.viewport;
      handleScroll2();
      viewport.addEventListener("scroll", handleScroll2);
      return () => viewport.removeEventListener("scroll", handleScroll2);
    }
  }, [contentContext.viewport, contentContext.isPositioned]);
  return canScrollDown ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectScrollButtonImpl,
    {
      ...props,
      ref: composedRefs,
      onAutoScroll: () => {
        const { viewport, selectedItem } = contentContext;
        if (viewport && selectedItem) {
          viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight;
        }
      }
    }
  ) : null;
});
SelectScrollDownButton$1.displayName = SCROLL_DOWN_BUTTON_NAME;
var SelectScrollButtonImpl = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeSelect, onAutoScroll, ...scrollIndicatorProps } = props;
  const contentContext = useSelectContentContext("SelectScrollButton", __scopeSelect);
  const autoScrollTimerRef = reactExports.useRef(null);
  const getItems = useCollection(__scopeSelect);
  const clearAutoScrollTimer = reactExports.useCallback(() => {
    if (autoScrollTimerRef.current !== null) {
      window.clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);
  reactExports.useEffect(() => {
    return () => clearAutoScrollTimer();
  }, [clearAutoScrollTimer]);
  useLayoutEffect2(() => {
    const activeItem = getItems().find((item) => item.ref.current === document.activeElement);
    activeItem?.ref.current?.scrollIntoView({ block: "nearest" });
  }, [getItems]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "aria-hidden": true,
      ...scrollIndicatorProps,
      ref: forwardedRef,
      style: { flexShrink: 0, ...scrollIndicatorProps.style },
      onPointerDown: composeEventHandlers(scrollIndicatorProps.onPointerDown, () => {
        if (autoScrollTimerRef.current === null) {
          autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50);
        }
      }),
      onPointerMove: composeEventHandlers(scrollIndicatorProps.onPointerMove, () => {
        contentContext.onItemLeave?.();
        if (autoScrollTimerRef.current === null) {
          autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50);
        }
      }),
      onPointerLeave: composeEventHandlers(scrollIndicatorProps.onPointerLeave, () => {
        clearAutoScrollTimer();
      })
    }
  );
});
var SEPARATOR_NAME = "SelectSeparator";
var SelectSeparator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...separatorProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { "aria-hidden": true, ...separatorProps, ref: forwardedRef });
  }
);
SelectSeparator.displayName = SEPARATOR_NAME;
var ARROW_NAME = "SelectArrow";
var SelectArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeSelect);
    const contentContext = useSelectContentContext(ARROW_NAME, __scopeSelect);
    return contentContext.position === "popper" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef }) : null;
  }
);
SelectArrow.displayName = ARROW_NAME;
var BUBBLE_INPUT_NAME = "SelectBubbleInput";
var SelectBubbleInput = reactExports.forwardRef(
  ({ __scopeSelect, ...props }, forwardedRef) => {
    const context = useSelectContext(BUBBLE_INPUT_NAME, __scopeSelect);
    const { value, onValueChange, required, disabled, name, autoComplete, form } = context;
    const { nativeOptions, nativeSelectKey } = context;
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const selectValue = value ?? "";
    const prevValue = usePrevious(selectValue);
    reactExports.useEffect(() => {
      const select = ref.current;
      if (!select) return;
      const selectProto = window.HTMLSelectElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        selectProto,
        "value"
      );
      const setValue = descriptor.set;
      if (prevValue !== selectValue && setValue) {
        const event = new Event("change", { bubbles: true });
        setValue.call(select, selectValue);
        select.dispatchEvent(event);
      }
    }, [prevValue, selectValue]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Primitive.select,
      {
        "aria-hidden": true,
        required,
        tabIndex: -1,
        name,
        autoComplete,
        disabled,
        form,
        onChange: (event) => onValueChange(event.target.value),
        ...props,
        style: { ...VISUALLY_HIDDEN_STYLES, ...props.style },
        ref: composedRefs,
        defaultValue: selectValue,
        children: [
          shouldShowPlaceholder(value) ? /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "" }) : null,
          Array.from(nativeOptions)
        ]
      },
      nativeSelectKey
    );
  }
);
SelectBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
  return typeof value === "function";
}
function shouldShowPlaceholder(value) {
  return value === "" || value === void 0;
}
function useTypeaheadSearch(onSearchChange) {
  const handleSearchChange = useCallbackRef(onSearchChange);
  const searchRef = reactExports.useRef("");
  const timerRef = reactExports.useRef(0);
  const handleTypeaheadSearch = reactExports.useCallback(
    (key) => {
      const search = searchRef.current + key;
      handleSearchChange(search);
      (function updateSearch(value) {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") timerRef.current = window.setTimeout(() => updateSearch(""), 1e3);
      })(search);
    },
    [handleSearchChange]
  );
  const resetTypeahead = reactExports.useCallback(() => {
    searchRef.current = "";
    window.clearTimeout(timerRef.current);
  }, []);
  reactExports.useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);
  return [searchRef, handleTypeaheadSearch, resetTypeahead];
}
function findNextItem(items, search, currentItem) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentItemIndex = currentItem ? items.indexOf(currentItem) : -1;
  let wrappedItems = wrapArray(items, Math.max(currentItemIndex, 0));
  const excludeCurrentItem = normalizedSearch.length === 1;
  if (excludeCurrentItem) wrappedItems = wrappedItems.filter((v) => v !== currentItem);
  const nextItem = wrappedItems.find(
    (item) => item.textValue.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextItem !== currentItem ? nextItem : void 0;
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
const EMPTY_SENTINEL = "__dont__use__this__empty__value__";
function Select({
  value,
  defaultValue,
  onValueChange,
  ...props
}) {
  const mappedValue = value === "" ? EMPTY_SENTINEL : value;
  const mappedDefaultValue = defaultValue === "" ? EMPTY_SENTINEL : defaultValue;
  const handleChange = (val) => {
    onValueChange?.(val === EMPTY_SENTINEL ? "" : val);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Select$1, { "data-slot": "select", value: mappedValue, defaultValue: mappedDefaultValue, onValueChange: handleChange, ...props });
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue$1, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger$1, { "data-slot": "select-trigger", "data-size": size, className: cn("border-input data-[placeholder]:text-muted-foreground data-[state=open]:border-ring [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] enabled:hover:border-ring disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:transition-transform [&_svg]:duration-200 data-[state=open]:[&_svg]:rotate-180", className), ...props, children: props.asChild ? children : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectIcon, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
  ] }) });
}
function SelectContent({
  className,
  children,
  position = "popper",
  align = "center",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent$1, { "data-slot": "select-content", className: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className), position, align, ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollUpButton, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectViewport, { className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"), children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollDownButton, {})
  ] }) });
}
function SelectItem({
  className,
  children,
  disabled,
  onClick,
  onMouseDown,
  onKeyDown,
  onKeyUp,
  onPointerDown,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem$1, { "data-slot": "select-item", className: cn("focus:bg-accent focus:text-accent-foreground data-[state=checked]:text-primary data-[state=checked]:[&_svg:not([class*='text-'])]:text-primary relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className), value: value === "" ? EMPTY_SENTINEL : value, disabled, onClick: (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }, onMouseDown: disabled ? void 0 : onMouseDown, onKeyDown: disabled ? void 0 : onKeyDown, onKeyUp: disabled ? void 0 : onKeyUp, onPointerDown: (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onPointerDown?.(event);
  }, ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItemIndicator, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItemText, { children })
  ] });
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollUpButton$1, { "data-slot": "select-scroll-up-button", className: cn("flex cursor-default items-center justify-center py-1", className), ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "size-4" }) });
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollDownButton$1, { "data-slot": "select-scroll-down-button", className: cn("flex cursor-default items-center justify-center py-1", className), ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4" }) });
}
function Textarea({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { "data-slot": "textarea", className: cn("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] enabled:hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className), ...props });
}
const ReportBlockDialogs = ({
  showReport,
  onReportOpenChange,
  showBlock,
  onBlockOpenChange,
  opponentNickname,
  onPlaySfx
}) => {
  const [reportReason, setReportReason] = reactExports.useState(REPORT_REASONS[0]);
  const [reportDetail, setReportDetail] = reactExports.useState("");
  const [reportSubmitted, setReportSubmitted] = reactExports.useState(false);
  const [blockReason, setBlockReason] = reactExports.useState("");
  const [blockedDone, setBlockedDone] = reactExports.useState(false);
  const handleOpenReport = (open) => {
    if (open) {
      setReportReason(REPORT_REASONS[0]);
      setReportDetail("");
      setReportSubmitted(false);
    }
    onReportOpenChange(open);
  };
  const handleOpenBlock = (open) => {
    if (open) {
      setBlockReason("");
      setBlockedDone(false);
    }
    onBlockOpenChange(open);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showReport, onOpenChange: handleOpenReport, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "cyber-card max-w-md", style: {
      borderColor: "var(--yellow)",
      boxShadow: "0 0 30px rgba(250, 204, 21, 0.3)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-cyber text-xl tracking-wider", style: {
          color: "var(--yellow)",
          textShadow: "0 0 10px rgba(250, 204, 21, 0.5)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { size: 18, className: "inline mr-2" }),
          "舉報玩家"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-[var(--text-secondary)] text-sm", children: [
          "被舉報玩家：",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--text-primary)] font-cyber", children: opponentNickname })
        ] })
      ] }),
      reportSubmitted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block p-4 rounded-full mb-4", style: {
          backgroundColor: "rgba(0, 255, 128, 0.1)",
          border: "1px solid var(--green)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { size: 32, style: {
          color: "var(--green)"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-neon-green font-cyber tracking-wider", children: "舉報已提交" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[var(--text-secondary)] mt-2", children: "官方將在 24 小時內處理，感謝您的回饋" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2", children: "舉報原因" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reportReason, onValueChange: setReportReason, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", style: {
              borderColor: "rgba(250, 204, 21, 0.3)",
              color: "var(--text-primary)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "請選擇原因" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { style: {
              backgroundColor: "hsl(240, 18%, 10%)",
              borderColor: "var(--yellow)"
            }, children: REPORT_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, className: "text-[var(--text-primary)]", children: r }, r)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2", children: "補充說明（選填）" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: reportDetail, onChange: (e) => setReportDetail(e.target.value), placeholder: "請描述具體情況...", className: "w-full min-h-[100px] resize-none", style: {
            borderColor: "rgba(250, 204, 21, 0.3)",
            color: "var(--text-primary)",
            backgroundColor: "hsl(240, 20%, 8%)"
          } })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: reportSubmitted ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onReportOpenChange(false), className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto", style: {
        borderColor: "var(--green)",
        color: "var(--green)"
      }, children: "確定" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onReportOpenChange(false), className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          onPlaySfx?.();
          submitReport(opponentNickname, void 0, reportReason, reportDetail);
          setReportSubmitted(true);
        }, className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider", style: {
          borderColor: "var(--yellow)",
          color: "var(--yellow)"
        }, children: "提交舉報" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showBlock, onOpenChange: handleOpenBlock, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "cyber-card max-w-md", style: {
      borderColor: "var(--red)",
      boxShadow: "0 0 30px rgba(255, 77, 109, 0.3)",
      backgroundColor: "hsl(240, 18%, 10%)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-cyber text-xl tracking-wider", style: {
          color: "var(--red)",
          textShadow: "0 0 10px rgba(255, 77, 109, 0.5)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 18, className: "inline mr-2" }),
          "確認拉黑"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-[var(--text-secondary)] text-sm", children: "拉黑後，你將不會再與該玩家匹配到同一局遊戲。" })
      ] }),
      blockedDone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block p-4 rounded-full mb-4", style: {
          backgroundColor: "rgba(255, 77, 109, 0.1)",
          border: "1px solid var(--red)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 32, style: {
          color: "var(--red)"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-cyber tracking-wider", style: {
          color: "var(--red)"
        }, children: "已加入黑名單" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[var(--text-secondary)] mt-2", children: [
          opponentNickname,
          " 已被拉黑"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded", style: {
          border: "1px solid rgba(255, 77, 109, 0.3)",
          backgroundColor: "rgba(255, 77, 109, 0.05)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-muted)] mb-1", children: "拉黑對象" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-[var(--text-primary)]", children: opponentNickname })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2", children: "拉黑原因（選填）" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: blockReason, onChange: (e) => setBlockReason(e.target.value), placeholder: "簡述拉黑原因...", className: "w-full min-h-[60px] resize-none", style: {
            borderColor: "rgba(255, 77, 109, 0.3)",
            color: "var(--text-primary)",
            backgroundColor: "hsl(240, 20%, 8%)"
          } })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: blockedDone ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onBlockOpenChange(false), className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto", style: {
        borderColor: "var(--red)",
        color: "var(--red)"
      }, children: "確定" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onBlockOpenChange(false), className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto", children: "取消" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          onPlaySfx?.();
          blockPlayer(opponentNickname, void 0, blockReason);
          setBlockedDone(true);
        }, className: "cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider", style: {
          borderColor: "var(--red)",
          color: "var(--red)"
        }, children: "確認拉黑" })
      ] }) })
    ] }) })
  ] });
};
const MODES = [{
  key: "classic",
  label: MODE_LABELS.classic,
  color: "var(--cyan)",
  description: "標準規則，穩步經營"
}, {
  key: "fast",
  label: MODE_LABELS.fast,
  color: "var(--green)",
  description: "地價更低，節奏更快"
}, {
  key: "crazy",
  label: MODE_LABELS.crazy,
  color: "var(--pink)",
  description: "命運加倍，瘋狂豪賭"
}];
const PLAYER_COUNTS = [2, 4, 6];
const POLL_INTERVAL_MS = 2e3;
const TIMEOUT_SECONDS = 30;
const QuickMatchPage = () => {
  const navigate = useNavigate();
  const {
    visitorId,
    nickname
  } = usePlayerIdentity();
  const {
    playSfx
  } = useAudio();
  const [phase, setPhase] = reactExports.useState("config");
  const [selectedMode, setSelectedMode] = reactExports.useState("classic");
  const [selectedPlayers, setSelectedPlayers] = reactExports.useState(2);
  const [error, setError] = reactExports.useState("");
  const [waitedSeconds, setWaitedSeconds] = reactExports.useState(0);
  const [queuePosition, setQueuePosition] = reactExports.useState(0);
  const [matchedRoomCode, setMatchedRoomCode] = reactExports.useState("");
  const [matchedPlayerIndex, setMatchedPlayerIndex] = reactExports.useState(0);
  const [matchedOpponent, setMatchedOpponent] = reactExports.useState("");
  const [showReportDialog, setShowReportDialog] = reactExports.useState(false);
  const [showBlockDialog, setShowBlockDialog] = reactExports.useState(false);
  const [skipMessage, setSkipMessage] = reactExports.useState("");
  const pollTimerRef = reactExports.useRef(null);
  const secondTimerRef = reactExports.useRef(null);
  const hasJoinedRef = reactExports.useRef(false);
  const clearTimers = reactExports.useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (secondTimerRef.current !== null) {
      window.clearInterval(secondTimerRef.current);
      secondTimerRef.current = null;
    }
  }, []);
  const leaveQueue = reactExports.useCallback(async () => {
    if (!visitorId || !hasJoinedRef.current) return;
    try {
      await matchmakingApi.leaveMatch(visitorId);
    } catch (err) {
      logger.warn("leaveMatch failed", err instanceof Error ? err.message : String(err));
    }
    hasJoinedRef.current = false;
  }, [visitorId]);
  const stopMatching = reactExports.useCallback(async () => {
    clearTimers();
    await leaveQueue();
    setPhase("config");
    setWaitedSeconds(0);
    setQueuePosition(0);
  }, [clearTimers, leaveQueue]);
  reactExports.useEffect(() => {
    return () => {
      clearTimers();
      void leaveQueue();
    };
  }, [clearTimers, leaveQueue]);
  const goToRoom = reactExports.useCallback((roomCode, playerIndex) => {
    clearTimers();
    hasJoinedRef.current = false;
    try {
      sessionStorage.setItem("monopoly_online_room", JSON.stringify({
        roomCode,
        playerIndex
      }));
    } catch {
    }
    navigate(`/online/room/${roomCode}?player=${playerIndex}`);
  }, [clearTimers, navigate]);
  const pollStatus = reactExports.useCallback(async () => {
    if (!visitorId) return;
    try {
      const status = await matchmakingApi.getMatchStatus(visitorId);
      if (!status.inQueue && !status.matchedRoomCode) {
        setError("配對連線已中斷，請重試");
        setPhase("config");
        clearTimers();
        hasJoinedRef.current = false;
        return;
      }
      setQueuePosition(status.position);
      if (status.waitedSeconds !== void 0) {
        setWaitedSeconds(status.waitedSeconds);
      }
      if (status.matchedRoomCode && status.playerIndex !== null) {
        const mockOpponent = `玩家${status.matchedRoomCode.slice(-4)}`;
        if (isBlocked(mockOpponent)) {
          setSkipMessage(`對方在黑名單中，已跳過匹配（${mockOpponent}）`);
          window.setTimeout(() => {
            setSkipMessage("");
          }, 2e3);
          pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
          return;
        }
        setMatchedRoomCode(status.matchedRoomCode);
        setMatchedPlayerIndex(status.playerIndex);
        setMatchedOpponent(mockOpponent);
        setPhase("matched");
        clearTimers();
        hasJoinedRef.current = false;
        return;
      }
      pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
    } catch (err) {
      logger.warn("getMatchStatus failed", err instanceof Error ? err.message : String(err));
      pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
    }
  }, [visitorId, clearTimers, goToRoom]);
  const startMatching = reactExports.useCallback(async () => {
    if (!visitorId) {
      setError("玩家身份初始化中，請稍候");
      return;
    }
    if (!nickname) {
      setError("請先設定暱稱");
      return;
    }
    setError("");
    setWaitedSeconds(0);
    setQueuePosition(1);
    setPhase("matching");
    playSfx("click");
    try {
      const result = await matchmakingApi.joinMatch({
        visitorId,
        nickname,
        gameMode: selectedMode,
        maxPlayers: selectedPlayers
      });
      hasJoinedRef.current = true;
      setQueuePosition(result.position);
      setWaitedSeconds(result.waitedSeconds);
      secondTimerRef.current = window.setInterval(() => {
        setWaitedSeconds((prev) => prev + 1);
      }, 1e3);
      pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加入匹配失敗";
      setError(message);
      setPhase("config");
      hasJoinedRef.current = false;
    }
  }, [visitorId, nickname, selectedMode, selectedPlayers, playSfx, pollStatus]);
  const handleCancel = reactExports.useCallback(() => {
    playSfx("click");
    void stopMatching();
  }, [playSfx, stopMatching]);
  const handleContinueWaiting = reactExports.useCallback(() => {
    playSfx("click");
    setWaitedSeconds(0);
    setPhase("matching");
    if (hasJoinedRef.current && visitorId) {
      pollTimerRef.current = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
    }
  }, [playSfx, visitorId, pollStatus]);
  const handleGoCreateRoom = reactExports.useCallback(() => {
    playSfx("click");
    void stopMatching();
    navigate("/online/create");
  }, [playSfx, stopMatching, navigate]);
  const handleBack = reactExports.useCallback(() => {
    playSfx("click");
    navigate("/");
  }, [playSfx, navigate]);
  reactExports.useEffect(() => {
    if (phase === "matching" && waitedSeconds >= TIMEOUT_SECONDS) {
      clearTimers();
      setPhase("timeout");
    }
  }, [phase, waitedSeconds, clearTimers]);
  const currentMode = MODES.find((m) => m.key === selectedMode) ?? MODES[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
      phase === "config" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6 md:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider mb-2 pulse-glow", children: "快速匹配" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[var(--text-secondary)] text-sm font-cyber tracking-wider", children: "自動匹配 · 秒速開局" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14, className: "inline mr-1.5", style: {
              color: "var(--cyan)"
            } }),
            "選擇模式"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: MODES.map((mode) => {
            const isSelected = selectedMode === mode.key;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              playSfx("click");
              setSelectedMode(mode.key);
            }, className: "cyber-btn py-3 text-xs md:text-sm transition-all", style: {
              borderColor: isSelected ? mode.color : "rgba(0, 255, 255, 0.2)",
              color: isSelected ? mode.color : "var(--text-secondary)",
              boxShadow: isSelected ? `0 0 15px ${mode.color}50, inset 0 0 10px ${mode.color}20` : "none",
              background: isSelected ? `${mode.color}15` : "transparent"
            }, children: mode.label }, mode.key);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-[var(--text-muted)] text-center", children: currentMode.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block font-cyber text-sm tracking-wider text-[var(--text-secondary)] mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14, className: "inline mr-1.5", style: {
              color: "var(--pink)"
            } }),
            "玩家人數"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: PLAYER_COUNTS.map((count) => {
            const isSelected = selectedPlayers === count;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
              playSfx("click");
              setSelectedPlayers(count);
            }, className: "cyber-btn py-3 text-sm", style: {
              borderColor: isSelected ? "var(--pink)" : "rgba(255, 107, 157, 0.2)",
              color: isSelected ? "var(--pink)" : "var(--text-secondary)",
              boxShadow: isSelected ? "0 0 15px rgba(255, 107, 157, 0.4), inset 0 0 10px rgba(255, 107, 157, 0.15)" : "none",
              background: isSelected ? "rgba(255, 107, 157, 0.1)" : "transparent"
            }, children: [
              count,
              " 人"
            ] }, count);
          }) })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 text-sm text-center", style: {
          color: "var(--red)"
        }, children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: startMatching, className: "cyber-btn w-full py-4 text-lg font-cyber tracking-wider match-card-pulse", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, children: "閃電 開始匹配" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider flex items-center justify-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 14 }),
          "返回主選單"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-xs text-center text-[var(--text-muted)] font-cyber tracking-wider", children: "系統將自動匹配相同模式與人數的玩家" })
      ] }),
      (phase === "matching" || phase === "matched" || phase === "timeout") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6 md:p-8 text-center match-card-pulse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "neon-ring" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-2xl md:text-3xl tracking-widest mb-1 pulse-glow", style: {
          color: phase === "matched" ? "var(--green)" : "var(--cyan)"
        }, children: phase === "matched" ? "配對成功！" : phase === "timeout" ? "匹配時間較長" : "配對中..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[var(--text-secondary)] text-sm font-cyber tracking-wider mb-6", children: phase === "matched" ? "正在進入房間..." : phase === "timeout" ? "繼續等待還是建立房間？" : "正在尋找對手，請稍候" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-left mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2 px-3 cyber-card", style: {
            borderColor: "rgba(0, 255, 255, 0.15)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-[var(--text-secondary)] flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14, style: {
                color: "var(--cyan)"
              } }),
              "模式"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm tracking-wider", style: {
              color: currentMode.color
            }, children: currentMode.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2 px-3 cyber-card", style: {
            borderColor: "rgba(255, 107, 157, 0.15)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-[var(--text-secondary)] flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14, style: {
                color: "var(--pink)"
              } }),
              "人數"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-sm tracking-wider", style: {
              color: "var(--pink)"
            }, children: [
              selectedPlayers,
              " 人"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2 px-3 cyber-card", style: {
            borderColor: "rgba(77, 195, 255, 0.15)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-[var(--text-secondary)] flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14, style: {
                color: "var(--blue)"
              } }),
              "已等待"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-sm tracking-wider", style: {
              color: "var(--blue)"
            }, children: [
              waitedSeconds,
              " 秒"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2 px-3 cyber-card", style: {
            borderColor: "rgba(255, 200, 0, 0.15)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-[var(--text-secondary)] flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { size: 14, style: {
                color: "var(--yellow)"
              } }),
              "排隊位置"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-sm tracking-wider", style: {
              color: "var(--yellow)"
            }, children: [
              "第 ",
              queuePosition,
              " 位"
            ] })
          ] })
        ] }),
        phase === "matching" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleCancel, className: "cyber-btn cyber-btn-pink w-full py-3 text-base", children: "取消匹配" }),
        phase === "timeout" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleContinueWaiting, className: "cyber-btn w-full py-3 text-base", style: {
            borderColor: "var(--cyan)",
            color: "var(--cyan)"
          }, children: "繼續等待" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleGoCreateRoom, className: "cyber-btn cyber-btn-pink w-full py-3 text-base", children: "建立房間" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleCancel, className: "w-full text-sm text-[var(--text-secondary)] hover:text-neon-cyan transition-colors font-cyber tracking-wider", children: "取消" })
        ] }),
        phase === "matched" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 text-left", style: {
            borderColor: "rgba(0, 255, 128, 0.3)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-2", children: "對手資訊" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg tracking-wider text-neon-green", children: matchedOpponent }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-muted)] font-cyber mt-1", children: [
                "房間 ",
                matchedRoomCode,
                " · 你是玩家 ",
                matchedPlayerIndex + 1
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
                playSfx("click");
                setShowReportDialog(true);
              }, className: "cyber-btn flex-1 py-2 text-xs flex items-center justify-center gap-1", style: {
                borderColor: "var(--yellow)",
                color: "var(--yellow)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { size: 14 }),
                "舉報"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
                playSfx("click");
                setShowBlockDialog(true);
              }, className: "cyber-btn flex-1 py-2 text-xs flex items-center justify-center gap-1", style: {
                borderColor: "var(--red)",
                color: "var(--red)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 14 }),
                "拉黑"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => goToRoom(matchedRoomCode, matchedPlayerIndex), className: "cyber-btn w-full py-3 text-base", style: {
            borderColor: "var(--green)",
            color: "var(--green)",
            boxShadow: "0 0 15px rgba(0, 255, 128, 0.4)"
          }, children: "進入對局" })
        ] }),
        skipMessage && phase === "matching" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-3 text-xs font-cyber tracking-wider text-center rounded", style: {
          color: "var(--yellow)",
          border: "1px solid var(--yellow)",
          backgroundColor: "rgba(250, 204, 21, 0.1)",
          boxShadow: "0 0 10px rgba(250, 204, 21, 0.3)"
        }, children: [
          "注意 ",
          skipMessage
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ReportBlockDialogs, { showReport: showReportDialog, onReportOpenChange: setShowReportDialog, showBlock: showBlockDialog, onBlockOpenChange: setShowBlockDialog, opponentNickname: matchedOpponent, onPlaySfx: () => playSfx("click") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 text-[var(--text-muted)] text-xs font-cyber tracking-wider", children: "v1.0 · CYBER MONOPOLY" })
  ] });
};
export {
  QuickMatchPage as default
};
