var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { S as SvelteComponent, i as init, s as safe_not_equal, e as ensure_array_like, a as element, b as space, c as attr, d as insert, f as append, l as listen, n as noop, g as detach, h as destroy_each, j as createEventDispatcher, t as text, k as set_data, m as set_style, r as run_all, o as construct_svelte_component, p as create_component, q as mount_component, u as transition_out, v as check_outros, w as transition_in, x as destroy_component, y as localize, z as group_outros } from "./index-6bc3f34b.js";
const StarRating_svelte_svelte_type_style_lang = "";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  child_ctx[15] = i;
  return child_ctx;
}
__name(get_each_context, "get_each_context");
function create_if_block(ctx) {
  let label_1;
  let t;
  return {
    c() {
      label_1 = element("label");
      t = text(
        /*label*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, label_1, anchor);
      append(label_1, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*label*/
      2)
        set_data(
          t,
          /*label*/
          ctx2[1]
        );
    },
    d(detaching) {
      if (detaching) {
        detach(label_1);
      }
    }
  };
}
__name(create_if_block, "create_if_block");
function create_each_block(ctx) {
  let i_1;
  let i_1_class_value;
  let mounted;
  let dispose;
  function mouseover_handler() {
    return (
      /*mouseover_handler*/
      ctx[10](
        /*i*/
        ctx[15]
      )
    );
  }
  __name(mouseover_handler, "mouseover_handler");
  function click_handler() {
    return (
      /*click_handler*/
      ctx[11](
        /*i*/
        ctx[15]
      )
    );
  }
  __name(click_handler, "click_handler");
  return {
    c() {
      i_1 = element("i");
      attr(i_1, "class", i_1_class_value = /*icon*/
      ctx[0] + " " + /*star*/
      (ctx[13].active ? "active" : "") + " svelte-FF15-qjrcij");
      attr(i_1, "role", "button");
      attr(i_1, "tabindex", "0");
      set_style(
        i_1,
        "--active-color",
        /*activeColor*/
        ctx[2]
      );
    },
    m(target, anchor) {
      insert(target, i_1, anchor);
      if (!mounted) {
        dispose = [
          listen(i_1, "mouseover", mouseover_handler),
          listen(i_1, "click", click_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*icon, stars*/
      9 && i_1_class_value !== (i_1_class_value = /*icon*/
      ctx[0] + " " + /*star*/
      (ctx[13].active ? "active" : "") + " svelte-FF15-qjrcij")) {
        attr(i_1, "class", i_1_class_value);
      }
      if (dirty & /*activeColor*/
      4) {
        set_style(
          i_1,
          "--active-color",
          /*activeColor*/
          ctx[2]
        );
      }
    },
    d(detaching) {
      if (detaching) {
        detach(i_1);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
__name(create_each_block, "create_each_block");
function create_fragment$1(ctx) {
  let div1;
  let t;
  let div0;
  let mounted;
  let dispose;
  let if_block = (
    /*label*/
    ctx[1] && create_if_block(ctx)
  );
  let each_value = ensure_array_like(
    /*stars*/
    ctx[3]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div1 = element("div");
      if (if_block)
        if_block.c();
      t = space();
      div0 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div0, "class", "stars svelte-FF15-qjrcij");
      attr(div1, "class", "star-rating svelte-FF15-qjrcij");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      if (if_block)
        if_block.m(div1, null);
      append(div1, t);
      append(div1, div0);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div0, null);
        }
      }
      if (!mounted) {
        dispose = listen(
          div1,
          "mouseleave",
          /*handleMouseLeave*/
          ctx[5]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*label*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(div1, t);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*icon, stars, activeColor, handleMouseOver, handleClick*/
      93) {
        each_value = ensure_array_like(
          /*stars*/
          ctx2[3]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div0, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      if (if_block)
        if_block.d();
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
}
__name(create_fragment$1, "create_fragment$1");
function instance$1($$self, $$props, $$invalidate) {
  let stars;
  let { maxStars = 5 } = $$props;
  let { icon = "fas fa-star" } = $$props;
  let { value = 0 } = $$props;
  let { label = "" } = $$props;
  let { activeColor = "#ffd700" } = $$props;
  let hoverValue = 0;
  const dispatch = createEventDispatcher();
  function handleMouseOver(index) {
    $$invalidate(9, hoverValue = index + 1);
  }
  __name(handleMouseOver, "handleMouseOver");
  function handleMouseLeave() {
    $$invalidate(9, hoverValue = 0);
  }
  __name(handleMouseLeave, "handleMouseLeave");
  function handleClick(index) {
    $$invalidate(7, value = index + 1);
    dispatch("change", value);
  }
  __name(handleClick, "handleClick");
  const mouseover_handler = /* @__PURE__ */ __name((i) => handleMouseOver(i), "mouseover_handler");
  const click_handler = /* @__PURE__ */ __name((i) => handleClick(i), "click_handler");
  $$self.$$set = ($$props2) => {
    if ("maxStars" in $$props2)
      $$invalidate(8, maxStars = $$props2.maxStars);
    if ("icon" in $$props2)
      $$invalidate(0, icon = $$props2.icon);
    if ("value" in $$props2)
      $$invalidate(7, value = $$props2.value);
    if ("label" in $$props2)
      $$invalidate(1, label = $$props2.label);
    if ("activeColor" in $$props2)
      $$invalidate(2, activeColor = $$props2.activeColor);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*maxStars, hoverValue, value*/
    896) {
      $$invalidate(3, stars = Array(maxStars).fill(0).map((_, i) => ({
        active: hoverValue ? i < hoverValue : i < value
      })));
    }
  };
  return [
    icon,
    label,
    activeColor,
    stars,
    handleMouseOver,
    handleMouseLeave,
    handleClick,
    value,
    maxStars,
    hoverValue,
    mouseover_handler,
    click_handler
  ];
}
__name(instance$1, "instance$1");
const _StarRating = class _StarRating extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      maxStars: 8,
      icon: 0,
      value: 7,
      label: 1,
      activeColor: 2
    });
  }
};
__name(_StarRating, "StarRating");
let StarRating = _StarRating;
const ModifierDialog_svelte_svelte_type_style_lang = "";
function create_fragment(ctx) {
  let form;
  let div4;
  let div1;
  let div0;
  let switch_instance0;
  let div3;
  let div2;
  let switch_instance1;
  let current;
  var switch_value = StarRating;
  function switch_props(ctx2, dirty) {
    return {
      props: {
        label: localize("Modifiers.Penalty"),
        value: (
          /*penalty*/
          ctx2[0]
        ),
        maxStars: 7,
        icon: "fas fa-burst",
        activeColor: "var(--color-negative)"
      }
    };
  }
  __name(switch_props, "switch_props");
  if (switch_value) {
    switch_instance0 = construct_svelte_component(switch_value, switch_props(ctx));
    switch_instance0.$on(
      "change",
      /*change_handler*/
      ctx[5]
    );
  }
  var switch_value_1 = StarRating;
  function switch_props_1(ctx2, dirty) {
    return {
      props: {
        label: localize("Modifiers.Advantage"),
        value: (
          /*bonusDice*/
          ctx2[1]
        ),
        maxStars: 7,
        icon: "fas fa-dice-d20",
        activeColor: "var(--ff-border-color)"
      }
    };
  }
  __name(switch_props_1, "switch_props_1");
  if (switch_value_1) {
    switch_instance1 = construct_svelte_component(switch_value_1, switch_props_1(ctx));
    switch_instance1.$on(
      "change",
      /*change_handler_1*/
      ctx[6]
    );
  }
  return {
    c() {
      form = element("form");
      div4 = element("div");
      div1 = element("div");
      div0 = element("div");
      if (switch_instance0)
        create_component(switch_instance0.$$.fragment);
      div3 = element("div");
      div2 = element("div");
      if (switch_instance1)
        create_component(switch_instance1.$$.fragment);
      attr(div0, "class", "flexcol");
      attr(div1, "class", "flex1");
      attr(div2, "class", "flexcol");
      attr(div3, "class", "flex1");
      attr(div4, "class", "flexrow gap-15");
      attr(form, "class", "modifier-dialog svelte-FF15-paczb8");
    },
    m(target, anchor) {
      insert(target, form, anchor);
      append(form, div4);
      append(div4, div1);
      append(div1, div0);
      if (switch_instance0)
        mount_component(switch_instance0, div0, null);
      append(div4, div3);
      append(div3, div2);
      if (switch_instance1)
        mount_component(switch_instance1, div2, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (switch_value !== (switch_value = StarRating)) {
        if (switch_instance0) {
          group_outros();
          const old_component = switch_instance0;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance0 = construct_svelte_component(switch_value, switch_props(ctx2));
          switch_instance0.$on(
            "change",
            /*change_handler*/
            ctx2[5]
          );
          create_component(switch_instance0.$$.fragment);
          transition_in(switch_instance0.$$.fragment, 1);
          mount_component(switch_instance0, div0, null);
        } else {
          switch_instance0 = null;
        }
      } else if (switch_value) {
        const switch_instance0_changes = {};
        if (dirty & /*penalty*/
        1)
          switch_instance0_changes.value = /*penalty*/
          ctx2[0];
        switch_instance0.$set(switch_instance0_changes);
      }
      if (switch_value_1 !== (switch_value_1 = StarRating)) {
        if (switch_instance1) {
          group_outros();
          const old_component = switch_instance1;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value_1) {
          switch_instance1 = construct_svelte_component(switch_value_1, switch_props_1(ctx2));
          switch_instance1.$on(
            "change",
            /*change_handler_1*/
            ctx2[6]
          );
          create_component(switch_instance1.$$.fragment);
          transition_in(switch_instance1.$$.fragment, 1);
          mount_component(switch_instance1, div2, null);
        } else {
          switch_instance1 = null;
        }
      } else if (switch_value_1) {
        const switch_instance1_changes = {};
        if (dirty & /*bonusDice*/
        2)
          switch_instance1_changes.value = /*bonusDice*/
          ctx2[1];
        switch_instance1.$set(switch_instance1_changes);
      }
    },
    i(local) {
      if (current)
        return;
      if (switch_instance0)
        transition_in(switch_instance0.$$.fragment, local);
      if (switch_instance1)
        transition_in(switch_instance1.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance0)
        transition_out(switch_instance0.$$.fragment, local);
      if (switch_instance1)
        transition_out(switch_instance1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(form);
      }
      if (switch_instance0)
        destroy_component(switch_instance0);
      if (switch_instance1)
        destroy_component(switch_instance1);
    }
  };
}
__name(create_fragment, "create_fragment");
function instance($$self, $$props, $$invalidate) {
  let { penalty = 0 } = $$props;
  let { bonusDice = 0 } = $$props;
  let { mutuallyExclusive = false } = $$props;
  function handlePenaltyChange(value) {
    $$invalidate(0, penalty = value);
    if (mutuallyExclusive && value > 0)
      $$invalidate(1, bonusDice = 0);
  }
  __name(handlePenaltyChange, "handlePenaltyChange");
  function handleBonusChange(value) {
    $$invalidate(1, bonusDice = value);
    if (mutuallyExclusive && value > 0)
      $$invalidate(0, penalty = 0);
  }
  __name(handleBonusChange, "handleBonusChange");
  const change_handler = /* @__PURE__ */ __name((e) => handlePenaltyChange(e.detail), "change_handler");
  const change_handler_1 = /* @__PURE__ */ __name((e) => handleBonusChange(e.detail), "change_handler_1");
  $$self.$$set = ($$props2) => {
    if ("penalty" in $$props2)
      $$invalidate(0, penalty = $$props2.penalty);
    if ("bonusDice" in $$props2)
      $$invalidate(1, bonusDice = $$props2.bonusDice);
    if ("mutuallyExclusive" in $$props2)
      $$invalidate(4, mutuallyExclusive = $$props2.mutuallyExclusive);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*penalty, bonusDice*/
    3) {
      if (window._modifierDialogComponent) {
        window._modifierDialogComponent._state = { penalty, bonusDice };
      }
    }
  };
  return [
    penalty,
    bonusDice,
    handlePenaltyChange,
    handleBonusChange,
    mutuallyExclusive,
    change_handler,
    change_handler_1
  ];
}
__name(instance, "instance");
const _ModifierDialog = class _ModifierDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      penalty: 0,
      bonusDice: 1,
      mutuallyExclusive: 4
    });
  }
};
__name(_ModifierDialog, "ModifierDialog");
let ModifierDialog = _ModifierDialog;
export {
  ModifierDialog as default
};
//# sourceMappingURL=ModifierDialog-e0c15f86.js.map
