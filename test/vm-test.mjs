import { assert } from "chai";

import { VM } from "lispx-vm";

const vm = new VM();

describe("Objects", () => {

    it("Lisp and JS objects can be distinguished.", () => {

        assert(vm.is_lisp_object(vm.str("foo")));
        assert(vm.is_lisp_object(vm.sym("foo")));
        assert(vm.is_lisp_object(vm.lisp_class(vm.Object)));
        assert(vm.is_lisp_object(vm.lisp_class(vm.Class)));

        assert.isFalse(vm.is_lisp_object(null));
        assert.isFalse(vm.is_lisp_object(undefined));
        assert.isFalse(vm.is_lisp_object(true));
        assert.isFalse(vm.is_lisp_object(false));
        assert.isFalse(vm.is_lisp_object(12));
        assert.isFalse(vm.is_lisp_object("foo"));
        assert.isFalse(vm.is_lisp_object({}));
        assert.isFalse(vm.is_lisp_object([]));
        assert.isFalse(vm.is_lisp_object(String));

    });

    it("JS objects have OBJECT as class metaobject.", () => {

        assert.equal(vm.class_of(null), vm.lisp_class(vm.Object));
        assert.equal(vm.class_of(undefined), vm.lisp_class(vm.Object));
        assert.equal(vm.class_of(true), vm.lisp_class(vm.Object));
        assert.equal(vm.class_of(false), vm.lisp_class(vm.Object));
        assert.equal(vm.class_of(12), vm.lisp_class(vm.Object));
        assert.equal(vm.class_of("foo"), vm.lisp_class(vm.Object));
        assert.equal(vm.class_of({}), vm.lisp_class(vm.Object));
        assert.equal(vm.class_of([]), vm.lisp_class(vm.Object));
        assert.equal(vm.class_of(String), vm.lisp_class(vm.Object));

    });

    it("Value equality has strict equality semantics for JS objects.", () => {

        assert(vm.equal(null, null));
        assert(vm.equal(undefined, undefined));
        assert(vm.equal("foo", "foo"));
        assert(vm.equal(12, 12));

        assert.isFalse(vm.equal(null, undefined));
        assert.isFalse(vm.equal(undefined, null));
        assert.isFalse(vm.equal({}, {}));

    });

    it("Objects of different classes or JS objects can not be compared.", () => {

        const msg = "Type assertion failed";

        assert.throws(() => vm.compare(vm.num(1), vm.str("foo")), msg);
        assert.throws(() => vm.compare(vm.str("foo"), vm.num(1)), msg);
        assert.throws(() => vm.compare([], vm.num(1)), msg);

    });

});

describe("Classes", () => {

    it("Classes are named and registered in the root environment.", () => {

        function check_name(cls, name)
        {
            const lisp_class = vm.lisp_class(cls);
            const name_sym = vm.sym(name);

            // The name is an ordinary symbol in the variable namespace.
            assert.equal(lisp_class.get_name(), name_sym);

            // The symbol it's registered under in the environment is a
            // symbol in the class namespace.
            assert.equal(vm.get_environment().lookup(name_sym.to_class_symbol()),
                         lisp_class);

            /*
             * Check that the JS constructor function has a proper name.
             */
            const js_name = "Lisp_" + name.replace(/-/g, "_");
            assert.equal(cls.name, js_name);
        }

        check_name(vm.Object, "object");
        check_name(vm.String, "string");
        check_name(vm.Symbol, "symbol");
        check_name(vm.Number, "number");
        check_name(vm.Boolean, "boolean");
        check_name(vm.List, "list");
        check_name(vm.Cons, "cons");
        check_name(vm.Nil, "nil");
        check_name(vm.Void, "void");
        check_name(vm.Ignore, "ignore");
        check_name(vm.Environment, "environment");
        check_name(vm.Class, "class");
        check_name(vm.Built_in_class, "built-in-class");
        check_name(vm.Standard_class, "standard-class");
        check_name(vm.Operator, "operator");
        check_name(vm.Built_in_operator, "built-in-operator");
        check_name(vm.Fexpr, "fexpr");
        check_name(vm.Function, "function");
        check_name(vm.Continuation, "continuation");
        check_name(vm.Dynamic, "dynamic");
        check_name(vm.Input_stream, "input-stream");
        check_name(vm.String_input_stream, "string-input-stream");
        check_name(vm.Output_stream, "output-stream");
        check_name(vm.String_output_stream, "string-output-stream");

        check_name(vm.Standard_object, "standard-object");
        check_name(vm.Condition, "condition");
        check_name(vm.Error, "error");
        check_name(vm.Type_error, "type-error");
        check_name(vm.Unbound_symbol_error, "unbound-symbol-error");
        check_name(vm.Unbound_slot_error, "unbound-slot-error");
        check_name(vm.Unbound_method_error, "unbound-method-error");
        check_name(vm.Assertion_error, "assertion-error");
        check_name(vm.Match_error, "match-error");
        check_name(vm.Stream_error, "stream-error");
        check_name(vm.End_of_file, "end-of-file");
        check_name(vm.Reader_error, "reader-error");
        check_name(vm.Prompt_not_found_error, "prompt-not-found-error");

    });

    it("Classes have correct superclasses set.", () => {

        function check_superclass(js_class, js_superclass)
        {
            assert.equal(vm.lisp_class(js_class).get_superclass(),
                         vm.lisp_class(js_superclass));

            assert(js_class.prototype instanceof js_superclass);
        }

        assert.isNull(vm.lisp_class(vm.Object).get_superclass());
        check_superclass(vm.String, vm.Object);
        check_superclass(vm.Symbol, vm.Object);
        check_superclass(vm.Number, vm.Object);
        check_superclass(vm.Boolean, vm.Object);
        check_superclass(vm.List, vm.Object);
        check_superclass(vm.Cons, vm.List);
        check_superclass(vm.Nil, vm.List);
        check_superclass(vm.Void, vm.Object);
        check_superclass(vm.Ignore, vm.Object);
        check_superclass(vm.Environment, vm.Object);
        check_superclass(vm.Class, vm.Object);
        check_superclass(vm.Built_in_class, vm.Class);
        check_superclass(vm.Standard_class, vm.Class);
        check_superclass(vm.Operator, vm.Object);
        check_superclass(vm.Built_in_operator, vm.Operator);
        check_superclass(vm.Fexpr, vm.Operator);
        check_superclass(vm.Function, vm.Operator);
        check_superclass(vm.Continuation, vm.Object);
        check_superclass(vm.Input_stream, vm.Object);
        check_superclass(vm.String_input_stream, vm.Input_stream);
        check_superclass(vm.Output_stream, vm.Object);
        check_superclass(vm.String_output_stream, vm.Output_stream);

        check_superclass(vm.Standard_object, vm.Object);
        check_superclass(vm.Dynamic, vm.Standard_object);
        check_superclass(vm.Condition, vm.Standard_object);
        check_superclass(vm.Error, vm.Condition);
        check_superclass(vm.Type_error, vm.Error);
        check_superclass(vm.Unbound_symbol_error, vm.Error);
        check_superclass(vm.Unbound_slot_error, vm.Error);
        check_superclass(vm.Unbound_method_error, vm.Error);
        check_superclass(vm.Assertion_error, vm.Error);
        check_superclass(vm.Match_error, vm.Error);
        check_superclass(vm.Stream_error, vm.Error);
        check_superclass(vm.End_of_file, vm.Stream_error);
        check_superclass(vm.Reader_error, vm.Error);
        check_superclass(vm.Prompt_not_found_error, vm.Error);

    });

    it("Classes have correct metaclasses set.", () => {

        function check_metaclass(js_class, js_metaclass)
        {
            // Thanks to our nice object system, the following things
            // are both true:

            // 1) The Lisp class metaobject points to the Lisp
            // metaclass metaobject.
            assert.equal(vm.class_of(vm.lisp_class(js_class)),
                         vm.lisp_class(js_metaclass));

            // 2) The Lisp class metaobject is also an instance of the
            // JS metaclass.
            assert.instanceOf(vm.lisp_class(js_class),
                              js_metaclass);

            // (and of course of CLASS and OBJECT, too)
            assert.instanceOf(vm.lisp_class(js_class),
                              vm.Class);
            assert.instanceOf(vm.lisp_class(js_class),
                              vm.Object);
        }

        check_metaclass(vm.Object, vm.Built_in_class);
        check_metaclass(vm.String, vm.Built_in_class);
        check_metaclass(vm.Symbol, vm.Built_in_class);
        check_metaclass(vm.Number, vm.Built_in_class);
        check_metaclass(vm.Boolean, vm.Built_in_class);
        check_metaclass(vm.List, vm.Built_in_class);
        check_metaclass(vm.Cons, vm.Built_in_class);
        check_metaclass(vm.Nil, vm.Built_in_class);
        check_metaclass(vm.Void, vm.Built_in_class);
        check_metaclass(vm.Ignore, vm.Built_in_class);
        check_metaclass(vm.Environment, vm.Built_in_class);
        check_metaclass(vm.Class, vm.Built_in_class);
        check_metaclass(vm.Built_in_class, vm.Built_in_class);
        check_metaclass(vm.Standard_class, vm.Built_in_class);
        check_metaclass(vm.Operator, vm.Built_in_class);
        check_metaclass(vm.Built_in_operator, vm.Built_in_class);
        check_metaclass(vm.Fexpr, vm.Built_in_class);
        check_metaclass(vm.Function, vm.Built_in_class);
        check_metaclass(vm.Continuation, vm.Built_in_class);
        check_metaclass(vm.Input_stream, vm.Built_in_class);
        check_metaclass(vm.String_input_stream, vm.Built_in_class);
        check_metaclass(vm.Output_stream, vm.Built_in_class);
        check_metaclass(vm.String_output_stream, vm.Built_in_class);

        check_metaclass(vm.Standard_object, vm.Standard_class);
        check_metaclass(vm.Dynamic, vm.Standard_class);
        check_metaclass(vm.Condition, vm.Standard_class);
        check_metaclass(vm.Error, vm.Standard_class);
        check_metaclass(vm.Type_error, vm.Standard_class);
        check_metaclass(vm.Unbound_symbol_error, vm.Standard_class);
        check_metaclass(vm.Unbound_slot_error, vm.Standard_class);
        check_metaclass(vm.Unbound_method_error, vm.Standard_class);
        check_metaclass(vm.Assertion_error, vm.Standard_class);
        check_metaclass(vm.Match_error, vm.Standard_class);
        check_metaclass(vm.Stream_error, vm.Standard_class);
        check_metaclass(vm.End_of_file, vm.Standard_class);
        check_metaclass(vm.Reader_error, vm.Standard_class);
        check_metaclass(vm.Prompt_not_found_error, vm.Standard_class);

    });

    it("JS classes are linked to their class metaobjects and vice versa.", () => {

        function check_linkage(js_class)
        {
            assert.equal(vm.lisp_class(js_class).get_js_class(),
                         js_class);
        }

        check_linkage(vm.Object);
        check_linkage(vm.String);
        check_linkage(vm.Symbol);
        check_linkage(vm.Number);
        check_linkage(vm.Boolean);
        check_linkage(vm.List);
        check_linkage(vm.Cons);
        check_linkage(vm.Nil);
        check_linkage(vm.Void);
        check_linkage(vm.Ignore);
        check_linkage(vm.Environment);
        check_linkage(vm.Class);
        check_linkage(vm.Built_in_class);
        check_linkage(vm.Standard_class);
        check_linkage(vm.Operator);
        check_linkage(vm.Built_in_operator);
        check_linkage(vm.Fexpr);
        check_linkage(vm.Function);
        check_linkage(vm.Continuation);
        check_linkage(vm.Dynamic);
        check_linkage(vm.Input_stream);
        check_linkage(vm.String_input_stream);
        check_linkage(vm.Output_stream);
        check_linkage(vm.String_output_stream);

        check_linkage(vm.Standard_object);
        check_linkage(vm.Condition);
        check_linkage(vm.Error);
        check_linkage(vm.Type_error);
        check_linkage(vm.Unbound_symbol_error);
        check_linkage(vm.Unbound_slot_error);
        check_linkage(vm.Assertion_error);
        check_linkage(vm.Match_error);
        check_linkage(vm.Stream_error);
        check_linkage(vm.End_of_file);
        check_linkage(vm.Reader_error);

    });

    it("Test is_subclass().", () => {

        function is_subclass(sub, sup)
        {
            return vm.is_subclass(vm.lisp_class(sub), vm.lisp_class(sup));
        }

        assert(is_subclass(vm.Object, vm.Object));

        assert(is_subclass(vm.Class, vm.Object));
        assert.isFalse(is_subclass(vm.Object, vm.Class));

        assert(is_subclass(vm.Standard_class, vm.Object));
        assert(is_subclass(vm.Standard_class, vm.Class));

    });

    it("Classes can be created dynamically.", () => {

        const point2d_class = vm.make_standard_class(vm.sym("point-2d"),
                                                     vm.lisp_class(vm.Standard_object));
        assert.instanceOf(point2d_class, vm.Standard_class);
        assert.instanceOf(point2d_class, vm.Class);
        assert.instanceOf(point2d_class, vm.Object);
        assert(vm.equal(vm.class_of(point2d_class), vm.lisp_class(vm.Standard_class)));
        assert.typeOf(point2d_class.get_js_class(), "function");
        assert(vm.is_subclass(point2d_class, vm.lisp_class(vm.Standard_object)));
        assert(vm.is_subclass(point2d_class, vm.lisp_class(vm.Object)));

        const point2d = vm.make_instance(point2d_class, vm.sym("x"), 1, vm.sym("y"), 2);
        assert.instanceOf(point2d, point2d_class.get_js_class());
        assert.instanceOf(point2d, vm.Standard_object);
        assert.instanceOf(point2d, vm.Object);
        assert(vm.equal(vm.class_of(point2d), point2d_class));
        assert(vm.equal(point2d.slot_value(vm.sym("x")), 1));
        assert(vm.equal(point2d.slot_value(vm.sym("y")), 2));

        const point3d_class = vm.make_standard_class(vm.sym("point-3d"),
                                                     point2d_class);
        assert.instanceOf(point3d_class, vm.Standard_class);
        assert.instanceOf(point3d_class, vm.Class);
        assert.instanceOf(point3d_class, vm.Object);
        assert(vm.equal(vm.class_of(point3d_class), vm.lisp_class(vm.Standard_class)));
        assert.typeOf(point3d_class.get_js_class(), "function");
        assert(vm.is_subclass(point3d_class, point2d_class));
        assert(vm.is_subclass(point3d_class, vm.lisp_class(vm.Standard_object)));
        assert(vm.is_subclass(point3d_class, vm.lisp_class(vm.Object)));

        const point3d = vm.make_instance(point3d_class);
        assert.instanceOf(point3d, point3d_class.get_js_class());
        assert.instanceOf(point3d, point2d_class.get_js_class());
        assert.instanceOf(point3d, vm.Standard_object);
        assert.instanceOf(point3d, vm.Object);
        assert(vm.equal(vm.class_of(point3d), point3d_class));

        assert.equal(point2d_class.get_js_class().name, "point-2d");
        assert.equal(point3d_class.get_js_class().name, "point-3d");
        assert.equal(point2d.constructor.name, "point-2d");
        assert.equal(point3d.constructor.name, "point-3d");

    });

});

describe("Strings", () => {

    it("Lisp strings can be created from JS strings.", () => {

        const js_euro = "\u{20AC}";
        const lisp_euro = vm.str(js_euro);
        assert.instanceOf(lisp_euro, vm.String);
        assert.instanceOf(lisp_euro, vm.Object);
        assert.equal(vm.class_of(lisp_euro), vm.lisp_class(vm.String));
        assert.equal(lisp_euro.get_utf8_bytes(), "\u{E2}\u{82}\u{AC}");
        assert.equal(lisp_euro.to_js_string(), js_euro);

    });

    it("Lisp strings have value equality.", () => {

        assert(vm.equal(vm.str("foo"), vm.str("foo")));
        assert.isFalse(vm.equal(vm.str("foo"), vm.str("bar")));
        assert.isFalse(vm.equal(vm.str("foo"), vm.sym("foo")));

    });

});

describe("Symbols", () => {

    it("Symbols can be created from strings.", () => {

        const sym = vm.sym("henlo world");
        assert.instanceOf(sym, vm.Symbol);
        assert.instanceOf(sym, vm.Object);
        assert.equal(vm.class_of(sym), vm.lisp_class(vm.Symbol));
        assert(vm.equal(sym.get_string(), vm.str("henlo world")));

    });

    it("Symbols are interned.", () => {

        assert(vm.sym("foo") === vm.sym("foo"));
        assert(vm.sym("foo") !== vm.sym("bar"));

        // Can also use intern() on strings.
        assert(vm.sym("foo") === vm.intern(vm.str("foo")));

    });

    it("Equality works for symbols.", () => {

        assert(vm.equal(vm.sym("foo"), vm.sym("foo")));
        assert.isFalse(vm.equal(vm.sym("foo"), vm.sym("bar")));

    });

    it("Symbols have string names.", () => {

        assert(vm.equal(vm.sym("foo").get_string(), vm.str("foo")));

    });

    it("Symbols have namespaces.", () => {

        assert(vm.equal(vm.sym("foo").get_namespace(),
                        vm.VARIABLE_NAMESPACE));
        assert(vm.equal(vm.sym("foo").to_variable_symbol().get_namespace(),
                        vm.VARIABLE_NAMESPACE));
        assert(vm.equal(vm.sym("foo").to_function_symbol().get_namespace(),
                        vm.FUNCTION_NAMESPACE));
        assert(vm.equal(vm.sym("foo").to_class_symbol().get_namespace(),
                        vm.CLASS_NAMESPACE));
        assert(vm.equal(vm.sym("foo").to_keyword_symbol().get_namespace(),
                        vm.KEYWORD_NAMESPACE));

    });

    it("Symbols in different namespaces are distinct.", () => {

        assert(vm.sym("foo") !== vm.sym("foo").to_function_symbol());
        assert(vm.sym("foo") !== vm.sym("foo").to_class_symbol());
        assert(vm.sym("foo") !== vm.sym("foo").to_keyword_symbol());

    });

    it("Symbols in the same namespace are the same.", () => {

        assert(vm.sym("foo").to_variable_symbol() === vm.sym("foo").to_variable_symbol());
        assert(vm.sym("foo").to_function_symbol() === vm.sym("foo").to_function_symbol());
        assert(vm.sym("foo").to_class_symbol() === vm.sym("foo").to_class_symbol());
        assert(vm.sym("foo").to_keyword_symbol() === vm.sym("foo").to_keyword_symbol());

    });

    it("The namespace of a symbol is a string.", () => {

        assert.equal(vm.sym("foo").get_namespace(), "variable");
        assert.equal(vm.sym("foo").to_variable_symbol().get_namespace(), "variable");
        assert.equal(vm.sym("foo").to_function_symbol().get_namespace(), "function");
        assert.equal(vm.sym("foo").to_class_symbol().get_namespace(), "class");
        assert.equal(vm.sym("foo").to_keyword_symbol().get_namespace(), "keyword");

    });

    it("Namespaces can be passed to intern().", () => {

        assert.equal(vm.sym("foo"), vm.intern(vm.str("foo")));

        for (const ns of [vm.VARIABLE_NAMESPACE,
                          vm.FUNCTION_NAMESPACE,
                          vm.CLASS_NAMESPACE,
                          vm.KEYWORD_NAMESPACE]) {

            assert.equal(vm.sym("foo", ns), vm.intern(vm.str("foo"), ns));
        }

    });

    it("fsym() creates function symbols.", () => {

        assert.equal(vm.fsym("foo"), vm.sym("foo").to_function_symbol());

    });

    it("csym() creates class symbols.", () => {

        assert.equal(vm.csym("foo"), vm.sym("foo").to_class_symbol());

    });

    it("kwd() creates keyword symbols.", () => {

        assert.equal(vm.kwd("foo"), vm.sym("foo").to_keyword_symbol());

    });

});

describe("Numbers", () => {

    it("Lisp numbers can be created from JS strings and numbers.", () => {

        const n1 = vm.num(1);
        const n2 = vm.num("1");
        const n3 = vm.num("21092183098213098210938092183092131221420943032.3292103283");
        const n4 = vm.num("21092183098213098210938092183092131221420943032.3292103283");
        assert(vm.equal(n1, n2));
        assert(vm.equal(n3, n4));
        assert.isFalse(vm.equal(n1, n3));
        assert.isFalse(vm.equal(n1, n4));

        assert.instanceOf(n1, vm.Number);
        assert.instanceOf(n1, vm.Object);
        assert.equal(vm.class_of(n1), vm.lisp_class(vm.Number));

    });

    it("Lisp numbers can be turned into strings.", () => {

        const s1 = "-21092183098213098210938092183092131221420943032.329210328332921032833292";
        const s2 = "21092183098213098210938092183092131221420943032.329210328332921032833292";
        const n1 = vm.num(s1);
        const n2 = vm.num(s2);

        assert(vm.equal(vm.str(s1), n1.to_string()));
        assert(vm.equal(vm.str(s2), n2.to_string()));

    });

    it("Lisp numbers can be transformed to JS numbers.", () => {

        assert(vm.equal(vm.num(-1).to_js_number(), -1));
        assert(vm.equal(vm.num(0).to_js_number(), 0));
        assert(vm.equal(vm.num(1).to_js_number(), 1));

        assert(vm.equal(vm.num(-1.123).to_js_number(), -1.123));
        assert(vm.equal(vm.num(1.123).to_js_number(), 1.123));

        assert(vm.equal(vm.num(Number.MIN_SAFE_INTEGER).to_js_number(),
                        Number.MIN_SAFE_INTEGER));
        assert(vm.equal(vm.num(Number.MAX_SAFE_INTEGER).to_js_number(),
                        Number.MAX_SAFE_INTEGER));

        assert(vm.equal(vm.num("-10000000000000000000000000000000000000").to_js_number(),
                        -1e+37));
        assert(vm.equal(vm.num("10000000000000000000000000000000000000").to_js_number(),
                        1e+37));

    });

    it("Numbers can be compared.", () => {

        assert(vm.compare(vm.num(1), vm.num(1)) === 0);
        assert(vm.compare(vm.num(1), vm.num(2)) === -1);
        assert(vm.compare(vm.num(2), vm.num(1)) === 1);

    });

    it("Numbers can be added.", () => {

        assert(vm.equal(vm.add(vm.num(10), vm.num(20)), vm.num(30)));

    });

    it("Numbers can be subtracted.", () => {

        assert(vm.equal(vm.subtract(vm.num(10), vm.num(20)), vm.num(-10)));

    });

    it("Numbers can be multiplied.", () => {

        assert(vm.equal(vm.multiply(vm.num(10), vm.num(20)), vm.num(200)));

    });

    it("Numbers can be divided.", () => {

        assert(vm.equal(vm.divide(vm.num(10), vm.num(20)), vm.num(0.5)));

    });

});

describe("Booleans", () => {

    it("The booleans, er, exist.", () => {

        assert(vm.equal(vm.t(), vm.t()));
        assert(vm.equal(vm.f(), vm.f()));
        assert.isFalse(vm.equal(vm.t(), vm.f()));

        assert.instanceOf(vm.t(), vm.Boolean);
        assert.instanceOf(vm.t(), vm.Object);
        assert.instanceOf(vm.f(), vm.Boolean);
        assert.instanceOf(vm.f(), vm.Object);

        assert.equal(vm.class_of(vm.t()), vm.lisp_class(vm.Boolean));
        assert.equal(vm.class_of(vm.f()), vm.lisp_class(vm.Boolean));

        assert(vm.t().to_js_boolean());
        assert.isFalse(vm.f().to_js_boolean());

    });

});

describe("Lists", () => {

    it("cons() creates conses.", () => {

        const c1 = vm.cons(vm.num(1), vm.num(2));

        assert.instanceOf(c1, vm.Cons);
        assert.instanceOf(c1, vm.List);
        assert.instanceOf(c1, vm.Object);
        assert.equal(vm.class_of(c1), vm.lisp_class(vm.Cons));

        assert(vm.equal(c1.car(), vm.num(1)));
        assert(vm.equal(c1.cdr(), vm.num(2)));

    });

    it("Conses have value equality.", () => {

        const c1 = vm.cons(vm.num(1), vm.num(2));
        const c2 = vm.cons(vm.num(1), vm.num(2));
        const c3 = vm.cons(vm.num(100), vm.num(200));

        assert(vm.equal(c1, c2));
        assert.isFalse(vm.equal(c1, c3));

    });

    it("car and cdr are mutable.", () => {

        const c1 = vm.cons(vm.num(1), vm.num(2));
        c1.set_car(vm.str("foo"));
        c1.set_cdr(vm.str("bar"));
        assert(vm.equal(c1, vm.cons(vm.str("foo"), vm.str("bar"))));

    });

    it("Test elt().", () => {

        assert.throws(() => vm.elt(vm.nil(), 0), "Type assertion failed");
        assert.throws(() => vm.elt(vm.nil(), 1), "Type assertion failed");

        assert.equal(vm.elt(vm.list(1, 2, 3), 0), 1);
        assert.equal(vm.elt(vm.list(1, 2, 3), 1), 2);
        assert.equal(vm.elt(vm.list(1, 2, 3), 2), 3);

        assert.throws(() => vm.elt(vm.list(1, 2, 3), 3), "Type assertion failed");
        assert.throws(() => vm.elt(vm.list(1, 2, 3), 4), "Type assertion failed");

    });

    it("Test array_to_list() and list_to_array().", () => {

        let examples = [
            [[],
             vm.nil()],
            [[vm.num(1)],
             vm.cons(vm.num(1), vm.nil())],
            [[vm.num(1), vm.num(2)],
             vm.cons(vm.num(1), vm.cons(vm.num(2), vm.nil()))]
        ];

        for (const [array, list] of examples) {
            assert(vm.equal(vm.array_to_list(array), list));
            // Need deepEqual for arrays.
            assert.deepEqual(vm.list_to_array(list), array);
        }

    });

    it("Test list().", () => {

        assert(vm.equal(vm.list(),
                        vm.nil()));
        assert(vm.equal(vm.list(vm.num(1)),
                        vm.array_to_list([vm.num(1)])));
        assert(vm.equal(vm.list(vm.num(1), vm.num(2)),
                        vm.array_to_list([vm.num(1), vm.num(2)])));

    });

    it("Test list_star().", () => {

        assert(vm.equal(vm.list_star(),
                        vm.nil()));
        assert(vm.equal(vm.list_star(vm.num(1)),
                        vm.num(1)));
        assert(vm.equal(vm.list_star(vm.num(1), vm.num(2)),
                        vm.cons(vm.num(1), vm.num(2))));
        assert(vm.equal(vm.list_star(vm.num(1), vm.num(2), vm.num(3)),
                        vm.cons(vm.num(1), vm.cons(vm.num(2), vm.num(3)))));

    });

    it("Test reverse().", () => {

        assert(vm.equal(vm.reverse(vm.nil()), vm.nil()));
        assert(vm.equal(vm.reverse(vm.list(1, 2, 3)), vm.list(3, 2, 1)));

    });

    it("Test append().", () => {

        assert(vm.equal(vm.append(vm.nil(), vm.nil()), vm.nil()));
        assert(vm.equal(vm.append(vm.list(1), vm.nil()), vm.list(1)));
        assert(vm.equal(vm.append(vm.nil(), vm.list(1)), vm.list(1)));
        assert(vm.equal(vm.append(vm.nil(), vm.list(1, 2, 3)), vm.list(1, 2, 3)));
        assert(vm.equal(vm.append(vm.list(1, 2, 3), vm.nil()), vm.list(1, 2, 3)));
        assert(vm.equal(vm.append(vm.list(1, 2), vm.list(3, 4, 5)), vm.list(1, 2, 3, 4, 5)));
        assert(vm.equal(vm.append(vm.list(1, 2, 3), 4), vm.list_star(1, 2, 3, 4)));

    });

    it("Test some().", () => {

        assert(vm.equal(vm.some(vm.num(12)), vm.list(vm.num(12))));

    });

});

describe("#NIL", () => {

    it("Exists.", () => {

        assert.instanceOf(vm.nil(), vm.Nil);
        assert.instanceOf(vm.nil(), vm.List);
        assert.instanceOf(vm.nil(), vm.Object);
        assert.equal(vm.class_of(vm.nil()), vm.lisp_class(vm.Nil));

    });

});

describe("#VOID", () => {

    it("Exists.", () => {

        assert.instanceOf(vm.void(), vm.Void);
        assert.instanceOf(vm.void(), vm.Object);
        assert.equal(vm.class_of(vm.void()), vm.lisp_class(vm.Void));

    });

});

describe("#IGNORE", () => {

    it("Exists.", () => {

        assert.instanceOf(vm.ignore(), vm.Ignore);
        assert.instanceOf(vm.ignore(), vm.Object);
        assert.equal(vm.class_of(vm.ignore()), vm.lisp_class(vm.Ignore));

    });

});

describe("Environments", () => {

    it("Unbound variables lose.", () => {

        const e1 = vm.make_environment();
        const e2 = vm.make_environment(e1);
        const msg = "Unbound variable";
        assert.throws(() => e1.lookup(vm.sym("x")), msg);
        assert.throws(() => e2.lookup(vm.sym("x")), msg);

        assert.isFalse(e1.is_bound(vm.sym("x")));
        assert.isFalse(e2.is_bound(vm.sym("x")));

    });

    it("JS undefined can be used as a value.", () => {

        const e1 = vm.make_environment();
        const e2 = vm.make_environment(e1);

        e1.put(vm.sym("x"), undefined);
        assert.equal(e1.lookup(vm.sym("x")), undefined);
        assert.equal(e2.lookup(vm.sym("x")), undefined);

        assert(e1.is_bound(vm.sym("x")));
        assert(e2.is_bound(vm.sym("x")));

    });

    it("Values are inherited from the parent environment.", () => {

        const e1 = vm.make_environment();
        const e2 = vm.make_environment(e1);

        e1.put(vm.sym("x"), 12);
        e1.put(vm.sym("y"), 14);

        assert.equal(e1.lookup(vm.sym("x")), 12);
        assert.equal(e1.lookup(vm.sym("y")), 14);
        assert.equal(e2.lookup(vm.sym("x")), 12);
        assert.equal(e2.lookup(vm.sym("y")), 14);

        e2.put(vm.sym("x"), 42);

        assert.equal(e1.lookup(vm.sym("x")), 12);
        assert.equal(e1.lookup(vm.sym("y")), 14);
        assert.equal(e2.lookup(vm.sym("x")), 42);
        assert.equal(e2.lookup(vm.sym("y")), 14);

        assert(e1.is_bound(vm.sym("x")));
        assert(e1.is_bound(vm.sym("y")));
        assert(e2.is_bound(vm.sym("x")));
        assert(e2.is_bound(vm.sym("y")));

    });

    it("Values can be mutated.", () => {

        const e1 = vm.make_environment();
        const e2 = vm.make_environment(e1);

        e1.put(vm.sym("x"), 12);

        assert.equal(e1.lookup(vm.sym("x")), 12);
        assert.equal(e2.lookup(vm.sym("x")), 12);
        assert(e1.is_bound(vm.sym("x")));
        assert(e2.is_bound(vm.sym("x")));

        e1.put(vm.sym("x"), 42);

        assert.equal(e1.lookup(vm.sym("x")), 42);
        assert.equal(e2.lookup(vm.sym("x")), 42);
        assert(e1.is_bound(vm.sym("x")));
        assert(e2.is_bound(vm.sym("x")));

        e2.put(vm.sym("x"), 64);

        assert.equal(e1.lookup(vm.sym("x")), 42);
        assert.equal(e2.lookup(vm.sym("x")), 64);
        assert(e1.is_bound(vm.sym("x")));
        assert(e2.is_bound(vm.sym("x")));

    });

    it("An environment can contain same-named symbols with different namespaces.", () => {

        const e1 = vm.make_environment();

        const v = vm.sym("x");
        const f = vm.fsym("x");
        const c = vm.csym("x");

        e1.put(v, 1);
        e1.put(f, 2);
        e1.put(c, 3);

        assert.equal(e1.lookup(v), 1);
        assert.equal(e1.lookup(f), 2);
        assert.equal(e1.lookup(c), 3);

        assert(e1.is_bound(vm.sym("x")));
        assert(e1.is_bound(vm.fsym("x")));
        assert(e1.is_bound(vm.csym("x")));

    });

});

describe("Standard objects", () => {

    it("make_instance() creates new standard objects.", () => {

        const obj = vm.make_instance(vm.lisp_class(vm.Standard_object));
        vm.assert(obj instanceof vm.Standard_object);
        vm.assert(obj instanceof vm.Object);
        vm.assert(vm.equal(vm.class_of(obj), vm.lisp_class(vm.Standard_object)));

    });

    it("Slots can be created by make_instance() and accessed with slot_value().", () => {

        const obj = vm.make_instance(vm.lisp_class(vm.Standard_object),
                                     vm.sym("x"), vm.num(12),
                                     vm.kwd("y"), vm.num(24));

        assert(vm.equal(obj.slot_value(vm.sym("x")),
                        vm.num(12)));
        assert(vm.equal(obj.slot_value(vm.sym("y")),
                        vm.num(24)));

        // Can also use keyword symbols.
        assert(vm.equal(obj.slot_value(vm.kwd("x")),
                        vm.num(12)));
        assert(vm.equal(obj.slot_value(vm.kwd("y")),
                        vm.num(24)));

    });

    it("Slots can be updated with set_slot_value().", () => {

        const obj = vm.make_instance(vm.lisp_class(vm.Standard_object));
        obj.set_slot_value(vm.sym("foo"), vm.num(1));
        assert(vm.equal(obj.slot_value(vm.sym("foo")),
                        vm.num(1)));
        obj.set_slot_value(vm.sym("foo"), vm.num(2));
        assert(vm.equal(obj.slot_value(vm.sym("foo")),
                        vm.num(2)));

    });

    it("is_slot_bound() checks if slots are bound.", () => {

        const obj = vm.make_instance(vm.lisp_class(vm.Standard_object));
        assert.isFalse(obj.is_slot_bound(vm.sym("foo")));
        assert.isFalse(obj.is_slot_bound(vm.sym("bar")));

        obj.set_slot_value(vm.sym("foo"), vm.num(1));
        assert(obj.is_slot_bound(vm.sym("foo")));
        assert.isFalse(obj.is_slot_bound(vm.sym("bar")));

    });

});

describe("assert()", () => {

    it("It does nothing if the boolean is true.", () => {
        assert.equal(vm.assert(true), undefined);
    });

    it("It throws an exception if the boolean is false.", () => {
        assert.throws(() => vm.assert(false), "Assertion failed");
    });

    it("Exceptions are instances of vm.Assertion_error.", () => {
        try {
            vm.assert(false);
        } catch(e) {
            assert.instanceOf(e, vm.Assertion_error);
            return;
        }
        assert(false);
    });

    it("It supports a message.", () => {
        try {
            vm.assert(false, "Message");
        } catch(e) {
            assert.equal(e.message, "Message");
            assert.instanceOf(e, vm.Assertion_error);
            return;
        }
        assert(false);
    });

    it("The message defaults to 'Assertion failed'.", () => {
        try {
            vm.assert(false);
        } catch(e) {
            assert.equal(e.message, "Assertion failed");
            assert.instanceOf(e, vm.Assertion_error);
            return;
        }
        assert(false);
    });

});

describe("abstract_method()", () => {

    it("It throws an error.", () => {
        assert.throws(() => vm.abstract_method(), "Congratulations");
    });

});

/***** Types *****/

describe("has_type()", () => {

    it("It supports string type specs.", () => {
        assert(vm.has_type("foo", "string"));
        assert(vm.has_type(12, "number"));
        assert(vm.has_type({}, "object"));

        assert.isFalse(vm.has_type(12, "string"));
        assert.isFalse(vm.has_type("foo", "object"));
        assert.isFalse(vm.has_type({}, "number"));
    });

    it("It supports function type specs.", () => {
        assert(vm.has_type(vm.str("12"), vm.Object));
        assert(vm.has_type(vm.str("12"), vm.String));
        assert(vm.has_type(vm.num(12), vm.Number));
        assert(vm.has_type(vm.num(12), vm.Object));

        assert.isFalse(vm.has_type(vm.str("foo"), vm.Number));
        assert.isFalse(vm.has_type(vm.num(12), vm.String));
    });

    it("It supports 'any' type specs.", () => {
        assert(vm.has_type(null, vm.TYPE_ANY));
        assert(vm.has_type(12, vm.TYPE_ANY));
        assert(vm.has_type("foo", vm.TYPE_ANY));
    });

    it("It supports 'null' type specs.", () => {
        assert(vm.has_type(null, vm.TYPE_NULL));

        assert.isFalse(vm.has_type(12, vm.TYPE_NULL));
        assert.isFalse(vm.has_type("foo", vm.TYPE_NULL));
    });

    it("It supports n-ary 'or' type specs.", () => {
        assert.isFalse(vm.has_type(null, vm.type_or()));

        assert(vm.has_type(null, vm.type_or(vm.TYPE_NULL)));

        assert(vm.has_type(null, vm.type_or(vm.TYPE_NULL, "string")));
        assert(vm.has_type(null, vm.type_or("string", vm.TYPE_NULL)));

        assert(vm.has_type(null, vm.type_or(vm.TYPE_NULL, "string", "number")));
        assert(vm.has_type(null, vm.type_or("string", vm.TYPE_NULL, "number")));
        assert(vm.has_type(null, vm.type_or("string", "number", vm.TYPE_NULL)));

        assert(vm.has_type(12, vm.type_or(vm.TYPE_NULL, "string", "number")));
        assert(vm.has_type(12, vm.type_or("string", vm.TYPE_NULL, "number")));
        assert(vm.has_type(12, vm.type_or("string", "number", vm.TYPE_NULL)));

        assert.isFalse(vm.has_type(true, vm.type_or(vm.TYPE_NULL, "string", "number")));
        assert.isFalse(vm.has_type(true, vm.type_or("string", vm.TYPE_NULL, "number")));
        assert.isFalse(vm.has_type(true, vm.type_or("string", "number", vm.TYPE_NULL)));

        assert.isFalse(vm.has_type(12, vm.type_or(vm.TYPE_NULL, "string")));
        assert.isFalse(vm.has_type(12, vm.type_or("string", vm.TYPE_NULL)));

        assert(vm.has_type(12, vm.type_or("number", "string")));
        assert(vm.has_type(12, vm.type_or("string", "number")));

        assert(vm.has_type("foo", vm.type_or("number", "string")));
        assert(vm.has_type("foo", vm.type_or("string", "number")));
    });

    it("It throws if the type spec is illegal.", () => {
        var msg = "Unknown type spec";
        assert.throws(() => vm.has_type(1), msg);
        assert.throws(() => vm.has_type(1, 1), msg);
        assert.throws(() => vm.has_type(1, null), msg);
        assert.throws(() => vm.has_type(1, { foo: 12 }), msg);
    });

    it("Type specs can be converted to symbolic Lisp data.", () => {
        assert(vm.equal(vm.to_lisp_type_spec(vm.TYPE_ANY),
                        vm.sym("object")));
        assert(vm.equal(vm.to_lisp_type_spec(vm.TYPE_NULL),
                        vm.str("null")));
        assert(vm.equal(vm.to_lisp_type_spec("function"),
                        vm.str("function")));
        assert(vm.equal(vm.to_lisp_type_spec(vm.type_or()),
                        vm.list(vm.sym("or"))));
        assert(vm.equal(vm.to_lisp_type_spec(vm.type_or(vm.TYPE_NULL, vm.String)),
                        vm.list(vm.sym("or"), vm.str("null"), vm.sym("string"))));
    });

});

describe("assert_type()", () => {

    it("It supports simple type specs and returns the datum.", () => {
        assert.equal(vm.assert_type("foo", "string"), "foo");
        assert.equal(vm.assert_type(12, "number"), 12);
        assert.deepEqual(vm.assert_type({}, "object"), {});
    });

    it("It throws if the datum doesn't match the type spec.", () => {
        try {
            vm.assert_type(12, "string");
        } catch(e) {
            assert.equal(e.message, "Type assertion failed: expected \"string\"");
            assert.equal(e.lisp_slot_datum, 12);
            assert(vm.equal(e["lisp_slot_expected-type"], vm.str("string")));
            return;
        }
        assert(false);
    });

});

/***** UTF-8 *****/

describe("utf8_encode()", () => {

    it("It transforms UTF-16 to UTF-8.", () => {
        // The Unicode code point for the Euro sign, 0x20AC, becomes
        // three bytes in UTF-8:
        // https://en.wikipedia.org/wiki/UTF-8#Examples
        const euro_utf16 = "\u{20AC}";
        assert.equal(euro_utf16.length, 1);
        assert.equal(euro_utf16.charCodeAt(0), 0x20AC);
        const euro_utf8 = vm.utf8_encode(euro_utf16);
        assert.equal(euro_utf8.length, 3);
        assert.equal(euro_utf8.charCodeAt(0), 0xE2);
        assert.equal(euro_utf8.charCodeAt(1), 0x82);
        assert.equal(euro_utf8.charCodeAt(2), 0xAC);
    });

});

describe("utf8_decode()", () => {

    it("It transforms UTF-8 to UTF-16.", () => {
        const euro_utf8 = "\u{E2}\u{82}\u{AC}";
        assert.equal(euro_utf8.length, 3);
        assert.equal(euro_utf8.charCodeAt(0), 0xE2);
        assert.equal(euro_utf8.charCodeAt(1), 0x82);
        assert.equal(euro_utf8.charCodeAt(2), 0xAC);
        const euro_utf16 = vm.utf8_decode(euro_utf8);
        assert.equal(euro_utf16.length, 1);
        assert.equal(euro_utf16.charCodeAt(0), 0x20AC);
    });

});
