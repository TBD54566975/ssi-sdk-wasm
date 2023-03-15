(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fs'), require('path'), require('util'), require('crypto')) :
  typeof define === 'function' && define.amd ? define(['fs', 'path', 'util', 'crypto'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["ssi-sdk-wasm"] = factory(global.fs$1, global.path, global.util, global.crypto$1));
})(this, (function (fs$1, path, util, crypto$1) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs$1);
  var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
  var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
  var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto$1);

  function _regeneratorRuntime() {
    _regeneratorRuntime = function () {
      return exports;
    };
    var exports = {},
      Op = Object.prototype,
      hasOwn = Op.hasOwnProperty,
      defineProperty = Object.defineProperty || function (obj, key, desc) {
        obj[key] = desc.value;
      },
      $Symbol = "function" == typeof Symbol ? Symbol : {},
      iteratorSymbol = $Symbol.iterator || "@@iterator",
      asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
      toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
    function define(obj, key, value) {
      return Object.defineProperty(obj, key, {
        value: value,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }), obj[key];
    }
    try {
      define({}, "");
    } catch (err) {
      define = function (obj, key, value) {
        return obj[key] = value;
      };
    }
    function wrap(innerFn, outerFn, self, tryLocsList) {
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
        generator = Object.create(protoGenerator.prototype),
        context = new Context(tryLocsList || []);
      return defineProperty(generator, "_invoke", {
        value: makeInvokeMethod(innerFn, self, context)
      }), generator;
    }
    function tryCatch(fn, obj, arg) {
      try {
        return {
          type: "normal",
          arg: fn.call(obj, arg)
        };
      } catch (err) {
        return {
          type: "throw",
          arg: err
        };
      }
    }
    exports.wrap = wrap;
    var ContinueSentinel = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var IteratorPrototype = {};
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });
    var getProto = Object.getPrototypeOf,
      NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        define(prototype, method, function (arg) {
          return this._invoke(method, arg);
        });
      });
    }
    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if ("throw" !== record.type) {
          var result = record.arg,
            value = result.value;
          return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          }) : PromiseImpl.resolve(value).then(function (unwrapped) {
            result.value = unwrapped, resolve(result);
          }, function (error) {
            return invoke("throw", error, resolve, reject);
          });
        }
        reject(record.arg);
      }
      var previousPromise;
      defineProperty(this, "_invoke", {
        value: function (method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
      });
    }
    function makeInvokeMethod(innerFn, self, context) {
      var state = "suspendedStart";
      return function (method, arg) {
        if ("executing" === state) throw new Error("Generator is already running");
        if ("completed" === state) {
          if ("throw" === method) throw arg;
          return doneResult();
        }
        for (context.method = method, context.arg = arg;;) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }
          if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
            if ("suspendedStart" === state) throw state = "completed", context.arg;
            context.dispatchException(context.arg);
          } else "return" === context.method && context.abrupt("return", context.arg);
          state = "executing";
          var record = tryCatch(innerFn, self, context);
          if ("normal" === record.type) {
            if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
            return {
              value: record.arg,
              done: context.done
            };
          }
          "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
        }
      };
    }
    function maybeInvokeDelegate(delegate, context) {
      var methodName = context.method,
        method = delegate.iterator[methodName];
      if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
      var record = tryCatch(method, delegate.iterator, context.arg);
      if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
      var info = record.arg;
      return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
    }
    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0]
      };
      1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
    }
    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal", delete record.arg, entry.completion = record;
    }
    function Context(tryLocsList) {
      this.tryEntries = [{
        tryLoc: "root"
      }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
    }
    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) return iteratorMethod.call(iterable);
        if ("function" == typeof iterable.next) return iterable;
        if (!isNaN(iterable.length)) {
          var i = -1,
            next = function next() {
              for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
              return next.value = undefined, next.done = !0, next;
            };
          return next.next = next;
        }
      }
      return {
        next: doneResult
      };
    }
    function doneResult() {
      return {
        value: undefined,
        done: !0
      };
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
      value: GeneratorFunctionPrototype,
      configurable: !0
    }), defineProperty(GeneratorFunctionPrototype, "constructor", {
      value: GeneratorFunction,
      configurable: !0
    }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
      var ctor = "function" == typeof genFun && genFun.constructor;
      return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
    }, exports.mark = function (genFun) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
    }, exports.awrap = function (arg) {
      return {
        __await: arg
      };
    }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
      return this;
    }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      void 0 === PromiseImpl && (PromiseImpl = Promise);
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
      return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
      return this;
    }), define(Gp, "toString", function () {
      return "[object Generator]";
    }), exports.keys = function (val) {
      var object = Object(val),
        keys = [];
      for (var key in object) keys.push(key);
      return keys.reverse(), function next() {
        for (; keys.length;) {
          var key = keys.pop();
          if (key in object) return next.value = key, next.done = !1, next;
        }
        return next.done = !0, next;
      };
    }, exports.values = values, Context.prototype = {
      constructor: Context,
      reset: function (skipTempReset) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
      },
      stop: function () {
        this.done = !0;
        var rootRecord = this.tryEntries[0].completion;
        if ("throw" === rootRecord.type) throw rootRecord.arg;
        return this.rval;
      },
      dispatchException: function (exception) {
        if (this.done) throw exception;
        var context = this;
        function handle(loc, caught) {
          return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
        }
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i],
            record = entry.completion;
          if ("root" === entry.tryLoc) return handle("end");
          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc"),
              hasFinally = hasOwn.call(entry, "finallyLoc");
            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
              if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            } else {
              if (!hasFinally) throw new Error("try statement without catch or finally");
              if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
            }
          }
        }
      },
      abrupt: function (type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }
        finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
        var record = finallyEntry ? finallyEntry.completion : {};
        return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
      },
      complete: function (record, afterLoc) {
        if ("throw" === record.type) throw record.arg;
        return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
      },
      finish: function (finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
        }
      },
      catch: function (tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if ("throw" === record.type) {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }
        throw new Error("illegal catch attempt");
      },
      delegateYield: function (iterable, resultName, nextLoc) {
        return this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
      }
    }, exports;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  // Copyright 2018 The Go Authors. All rights reserved.
  (function () {
    var enosys = function enosys() {
      var err = new Error("not implemented");
      err.code = "ENOSYS";
      return err;
    };
    if (!globalThis.fs) {
      var outputBuf = "";
      globalThis.fs = {
        constants: {
          O_WRONLY: -1,
          O_RDWR: -1,
          O_CREAT: -1,
          O_TRUNC: -1,
          O_APPEND: -1,
          O_EXCL: -1
        },
        // unused
        writeSync: function writeSync(fd, buf) {
          outputBuf += decoder.decode(buf);
          var nl = outputBuf.lastIndexOf("\n");
          if (nl != -1) {
            console.log(outputBuf.substring(0, nl));
            outputBuf = outputBuf.substring(nl + 1);
          }
          return buf.length;
        },
        write: function write(fd, buf, offset, length, position, callback) {
          if (offset !== 0 || length !== buf.length || position !== null) {
            callback(enosys());
            return;
          }
          var n = this.writeSync(fd, buf);
          callback(null, n);
        },
        chmod: function chmod(path, mode, callback) {
          callback(enosys());
        },
        chown: function chown(path, uid, gid, callback) {
          callback(enosys());
        },
        close: function close(fd, callback) {
          callback(enosys());
        },
        fchmod: function fchmod(fd, mode, callback) {
          callback(enosys());
        },
        fchown: function fchown(fd, uid, gid, callback) {
          callback(enosys());
        },
        fstat: function fstat(fd, callback) {
          callback(enosys());
        },
        fsync: function fsync(fd, callback) {
          callback(null);
        },
        ftruncate: function ftruncate(fd, length, callback) {
          callback(enosys());
        },
        lchown: function lchown(path, uid, gid, callback) {
          callback(enosys());
        },
        link: function link(path, _link, callback) {
          callback(enosys());
        },
        lstat: function lstat(path, callback) {
          callback(enosys());
        },
        mkdir: function mkdir(path, perm, callback) {
          callback(enosys());
        },
        open: function open(path, flags, mode, callback) {
          callback(enosys());
        },
        read: function read(fd, buffer, offset, length, position, callback) {
          callback(enosys());
        },
        readdir: function readdir(path, callback) {
          callback(enosys());
        },
        readlink: function readlink(path, callback) {
          callback(enosys());
        },
        rename: function rename(from, to, callback) {
          callback(enosys());
        },
        rmdir: function rmdir(path, callback) {
          callback(enosys());
        },
        stat: function stat(path, callback) {
          callback(enosys());
        },
        symlink: function symlink(path, link, callback) {
          callback(enosys());
        },
        truncate: function truncate(path, length, callback) {
          callback(enosys());
        },
        unlink: function unlink(path, callback) {
          callback(enosys());
        },
        utimes: function utimes(path, atime, mtime, callback) {
          callback(enosys());
        }
      };
    }
    if (!globalThis.process) {
      globalThis.process = {
        getuid: function getuid() {
          return -1;
        },
        getgid: function getgid() {
          return -1;
        },
        geteuid: function geteuid() {
          return -1;
        },
        getegid: function getegid() {
          return -1;
        },
        getgroups: function getgroups() {
          throw enosys();
        },
        pid: -1,
        ppid: -1,
        umask: function umask() {
          throw enosys();
        },
        cwd: function cwd() {
          throw enosys();
        },
        chdir: function chdir() {
          throw enosys();
        }
      };
    }
    if (!globalThis.crypto) {
      throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");
    }
    if (!globalThis.performance) {
      throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");
    }
    if (!globalThis.TextEncoder) {
      throw new Error("globalThis.TextEncoder is not available, polyfill required");
    }
    if (!globalThis.TextDecoder) {
      throw new Error("globalThis.TextDecoder is not available, polyfill required");
    }
    var encoder = new TextEncoder("utf-8");
    var decoder = new TextDecoder("utf-8");
    globalThis.Go = /*#__PURE__*/function () {
      function _class() {
        var _this = this;
        _classCallCheck(this, _class);
        this.argv = ["js"];
        this.env = {};
        this.exit = function (code) {
          if (code !== 0) {
            console.warn("exit code:", code);
          }
        };
        this._exitPromise = new Promise(function (resolve) {
          _this._resolveExitPromise = resolve;
        });
        this._pendingEvent = null;
        this._scheduledTimeouts = new Map();
        this._nextCallbackTimeoutID = 1;
        var setInt64 = function setInt64(addr, v) {
          _this.mem.setUint32(addr + 0, v, true);
          _this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
        };
        var getInt64 = function getInt64(addr) {
          var low = _this.mem.getUint32(addr + 0, true);
          var high = _this.mem.getInt32(addr + 4, true);
          return low + high * 4294967296;
        };
        var loadValue = function loadValue(addr) {
          var f = _this.mem.getFloat64(addr, true);
          if (f === 0) {
            return undefined;
          }
          if (!isNaN(f)) {
            return f;
          }
          var id = _this.mem.getUint32(addr, true);
          return _this._values[id];
        };
        var storeValue = function storeValue(addr, v) {
          var nanHead = 0x7FF80000;
          if (typeof v === "number" && v !== 0) {
            if (isNaN(v)) {
              _this.mem.setUint32(addr + 4, nanHead, true);
              _this.mem.setUint32(addr, 0, true);
              return;
            }
            _this.mem.setFloat64(addr, v, true);
            return;
          }
          if (v === undefined) {
            _this.mem.setFloat64(addr, 0, true);
            return;
          }
          var id = _this._ids.get(v);
          if (id === undefined) {
            id = _this._idPool.pop();
            if (id === undefined) {
              id = _this._values.length;
            }
            _this._values[id] = v;
            _this._goRefCounts[id] = 0;
            _this._ids.set(v, id);
          }
          _this._goRefCounts[id]++;
          var typeFlag = 0;
          switch (_typeof(v)) {
            case "object":
              if (v !== null) {
                typeFlag = 1;
              }
              break;
            case "string":
              typeFlag = 2;
              break;
            case "symbol":
              typeFlag = 3;
              break;
            case "function":
              typeFlag = 4;
              break;
          }
          _this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
          _this.mem.setUint32(addr, id, true);
        };
        var loadSlice = function loadSlice(addr) {
          var array = getInt64(addr + 0);
          var len = getInt64(addr + 8);
          return new Uint8Array(_this._inst.exports.mem.buffer, array, len);
        };
        var loadSliceOfValues = function loadSliceOfValues(addr) {
          var array = getInt64(addr + 0);
          var len = getInt64(addr + 8);
          var a = new Array(len);
          for (var i = 0; i < len; i++) {
            a[i] = loadValue(array + i * 8);
          }
          return a;
        };
        var loadString = function loadString(addr) {
          var saddr = getInt64(addr + 0);
          var len = getInt64(addr + 8);
          return decoder.decode(new DataView(_this._inst.exports.mem.buffer, saddr, len));
        };
        var timeOrigin = Date.now() - performance.now();
        this.importObject = {
          _gotest: {
            add: function add(a, b) {
              return a + b;
            }
          },
          // TODO: This is changed from gojs to go in order for the wasm_exec.js to work
          go: {
            // Go's SP does not change as long as no Go code is running. Some operations (e.g. calls, getters and setters)
            // may synchronously trigger a Go event handler. This makes Go code get executed in the middle of the imported
            // function. A goroutine can switch to a new stack if the current stack is too small (see morestack function).
            // This changes the SP, thus we have to update the SP used by the imported function.

            // func wasmExit(code int32)
            "runtime.wasmExit": function runtimeWasmExit(sp) {
              sp >>>= 0;
              var code = _this.mem.getInt32(sp + 8, true);
              _this.exited = true;
              delete _this._inst;
              delete _this._values;
              delete _this._goRefCounts;
              delete _this._ids;
              delete _this._idPool;
              _this.exit(code);
            },
            // func wasmWrite(fd uintptr, p unsafe.Pointer, n int32)
            "runtime.wasmWrite": function runtimeWasmWrite(sp) {
              sp >>>= 0;
              var fd = getInt64(sp + 8);
              var p = getInt64(sp + 16);
              var n = _this.mem.getInt32(sp + 24, true);
              fs.writeSync(fd, new Uint8Array(_this._inst.exports.mem.buffer, p, n));
            },
            // func resetMemoryDataView()
            "runtime.resetMemoryDataView": function runtimeResetMemoryDataView(sp) {
              _this.mem = new DataView(_this._inst.exports.mem.buffer);
            },
            // func nanotime1() int64
            "runtime.nanotime1": function runtimeNanotime1(sp) {
              sp >>>= 0;
              setInt64(sp + 8, (timeOrigin + performance.now()) * 1000000);
            },
            // func walltime() (sec int64, nsec int32)
            "runtime.walltime": function runtimeWalltime(sp) {
              sp >>>= 0;
              var msec = new Date().getTime();
              setInt64(sp + 8, msec / 1000);
              _this.mem.setInt32(sp + 16, msec % 1000 * 1000000, true);
            },
            // func scheduleTimeoutEvent(delay int64) int32
            "runtime.scheduleTimeoutEvent": function runtimeScheduleTimeoutEvent(sp) {
              sp >>>= 0;
              var id = _this._nextCallbackTimeoutID;
              _this._nextCallbackTimeoutID++;
              _this._scheduledTimeouts.set(id, setTimeout(function () {
                _this._resume();
                while (_this._scheduledTimeouts.has(id)) {
                  // for some reason Go failed to register the timeout event, log and try again
                  // (temporary workaround for https://github.com/golang/go/issues/28975)
                  console.warn("scheduleTimeoutEvent: missed timeout event");
                  _this._resume();
                }
              }, getInt64(sp + 8) + 1 // setTimeout has been seen to fire up to 1 millisecond early
              ));

              _this.mem.setInt32(sp + 16, id, true);
            },
            // func clearTimeoutEvent(id int32)
            "runtime.clearTimeoutEvent": function runtimeClearTimeoutEvent(sp) {
              sp >>>= 0;
              var id = _this.mem.getInt32(sp + 8, true);
              clearTimeout(_this._scheduledTimeouts.get(id));
              _this._scheduledTimeouts.delete(id);
            },
            // func getRandomData(r []byte)
            "runtime.getRandomData": function runtimeGetRandomData(sp) {
              sp >>>= 0;
              crypto.getRandomValues(loadSlice(sp + 8));
            },
            // func finalizeRef(v ref)
            "syscall/js.finalizeRef": function syscallJsFinalizeRef(sp) {
              sp >>>= 0;
              var id = _this.mem.getUint32(sp + 8, true);
              _this._goRefCounts[id]--;
              if (_this._goRefCounts[id] === 0) {
                var v = _this._values[id];
                _this._values[id] = null;
                _this._ids.delete(v);
                _this._idPool.push(id);
              }
            },
            // func stringVal(value string) ref
            "syscall/js.stringVal": function syscallJsStringVal(sp) {
              sp >>>= 0;
              storeValue(sp + 24, loadString(sp + 8));
            },
            // func valueGet(v ref, p string) ref
            "syscall/js.valueGet": function syscallJsValueGet(sp) {
              sp >>>= 0;
              var result = Reflect.get(loadValue(sp + 8), loadString(sp + 16));
              sp = _this._inst.exports.getsp() >>> 0; // see comment above
              storeValue(sp + 32, result);
            },
            // func valueSet(v ref, p string, x ref)
            "syscall/js.valueSet": function syscallJsValueSet(sp) {
              sp >>>= 0;
              Reflect.set(loadValue(sp + 8), loadString(sp + 16), loadValue(sp + 32));
            },
            // func valueDelete(v ref, p string)
            "syscall/js.valueDelete": function syscallJsValueDelete(sp) {
              sp >>>= 0;
              Reflect.deleteProperty(loadValue(sp + 8), loadString(sp + 16));
            },
            // func valueIndex(v ref, i int) ref
            "syscall/js.valueIndex": function syscallJsValueIndex(sp) {
              sp >>>= 0;
              storeValue(sp + 24, Reflect.get(loadValue(sp + 8), getInt64(sp + 16)));
            },
            // valueSetIndex(v ref, i int, x ref)
            "syscall/js.valueSetIndex": function syscallJsValueSetIndex(sp) {
              sp >>>= 0;
              Reflect.set(loadValue(sp + 8), getInt64(sp + 16), loadValue(sp + 24));
            },
            // func valueCall(v ref, m string, args []ref) (ref, bool)
            "syscall/js.valueCall": function syscallJsValueCall(sp) {
              sp >>>= 0;
              try {
                var v = loadValue(sp + 8);
                var m = Reflect.get(v, loadString(sp + 16));
                var args = loadSliceOfValues(sp + 32);
                var result = Reflect.apply(m, v, args);
                sp = _this._inst.exports.getsp() >>> 0; // see comment above
                storeValue(sp + 56, result);
                _this.mem.setUint8(sp + 64, 1);
              } catch (err) {
                sp = _this._inst.exports.getsp() >>> 0; // see comment above
                storeValue(sp + 56, err);
                _this.mem.setUint8(sp + 64, 0);
              }
            },
            // func valueInvoke(v ref, args []ref) (ref, bool)
            "syscall/js.valueInvoke": function syscallJsValueInvoke(sp) {
              sp >>>= 0;
              try {
                var v = loadValue(sp + 8);
                var args = loadSliceOfValues(sp + 16);
                var result = Reflect.apply(v, undefined, args);
                sp = _this._inst.exports.getsp() >>> 0; // see comment above
                storeValue(sp + 40, result);
                _this.mem.setUint8(sp + 48, 1);
              } catch (err) {
                sp = _this._inst.exports.getsp() >>> 0; // see comment above
                storeValue(sp + 40, err);
                _this.mem.setUint8(sp + 48, 0);
              }
            },
            // func valueNew(v ref, args []ref) (ref, bool)
            "syscall/js.valueNew": function syscallJsValueNew(sp) {
              sp >>>= 0;
              try {
                var v = loadValue(sp + 8);
                var args = loadSliceOfValues(sp + 16);
                var result = Reflect.construct(v, args);
                sp = _this._inst.exports.getsp() >>> 0; // see comment above
                storeValue(sp + 40, result);
                _this.mem.setUint8(sp + 48, 1);
              } catch (err) {
                sp = _this._inst.exports.getsp() >>> 0; // see comment above
                storeValue(sp + 40, err);
                _this.mem.setUint8(sp + 48, 0);
              }
            },
            // func valueLength(v ref) int
            "syscall/js.valueLength": function syscallJsValueLength(sp) {
              sp >>>= 0;
              setInt64(sp + 16, parseInt(loadValue(sp + 8).length));
            },
            // valuePrepareString(v ref) (ref, int)
            "syscall/js.valuePrepareString": function syscallJsValuePrepareString(sp) {
              sp >>>= 0;
              var str = encoder.encode(String(loadValue(sp + 8)));
              storeValue(sp + 16, str);
              setInt64(sp + 24, str.length);
            },
            // valueLoadString(v ref, b []byte)
            "syscall/js.valueLoadString": function syscallJsValueLoadString(sp) {
              sp >>>= 0;
              var str = loadValue(sp + 8);
              loadSlice(sp + 16).set(str);
            },
            // func valueInstanceOf(v ref, t ref) bool
            "syscall/js.valueInstanceOf": function syscallJsValueInstanceOf(sp) {
              sp >>>= 0;
              _this.mem.setUint8(sp + 24, loadValue(sp + 8) instanceof loadValue(sp + 16) ? 1 : 0);
            },
            // func copyBytesToGo(dst []byte, src ref) (int, bool)
            "syscall/js.copyBytesToGo": function syscallJsCopyBytesToGo(sp) {
              sp >>>= 0;
              var dst = loadSlice(sp + 8);
              var src = loadValue(sp + 32);
              if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
                _this.mem.setUint8(sp + 48, 0);
                return;
              }
              var toCopy = src.subarray(0, dst.length);
              dst.set(toCopy);
              setInt64(sp + 40, toCopy.length);
              _this.mem.setUint8(sp + 48, 1);
            },
            // func copyBytesToJS(dst ref, src []byte) (int, bool)
            "syscall/js.copyBytesToJS": function syscallJsCopyBytesToJS(sp) {
              sp >>>= 0;
              var dst = loadValue(sp + 8);
              var src = loadSlice(sp + 16);
              if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
                _this.mem.setUint8(sp + 48, 0);
                return;
              }
              var toCopy = src.subarray(0, dst.length);
              dst.set(toCopy);
              setInt64(sp + 40, toCopy.length);
              _this.mem.setUint8(sp + 48, 1);
            },
            "debug": function debug(value) {
              console.log(value);
            }
          }
        };
      }
      _createClass(_class, [{
        key: "run",
        value: function () {
          var _run = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(instance) {
            var _this2 = this;
            var offset, strPtr, argc, argvPtrs, keys, argv, wasmMinDataAddr;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (instance instanceof WebAssembly.Instance) {
                    _context.next = 2;
                    break;
                  }
                  throw new Error("Go.run: WebAssembly.Instance expected");
                case 2:
                  this._inst = instance;
                  this.mem = new DataView(this._inst.exports.mem.buffer);
                  this._values = [
                  // JS values that Go currently has references to, indexed by reference id
                  NaN, 0, null, true, false, globalThis, this];
                  this._goRefCounts = new Array(this._values.length).fill(Infinity); // number of references that Go has to a JS value, indexed by reference id
                  this._ids = new Map([
                  // mapping from JS values to reference ids
                  [0, 1], [null, 2], [true, 3], [false, 4], [globalThis, 5], [this, 6]]);
                  this._idPool = []; // unused ids that have been garbage collected
                  this.exited = false; // whether the Go program has exited

                  // Pass command line arguments and environment variables to WebAssembly by writing them to the linear memory.
                  offset = 4096;
                  strPtr = function strPtr(str) {
                    var ptr = offset;
                    var bytes = encoder.encode(str + "\0");
                    new Uint8Array(_this2.mem.buffer, offset, bytes.length).set(bytes);
                    offset += bytes.length;
                    if (offset % 8 !== 0) {
                      offset += 8 - offset % 8;
                    }
                    return ptr;
                  };
                  argc = this.argv.length;
                  argvPtrs = [];
                  this.argv.forEach(function (arg) {
                    argvPtrs.push(strPtr(arg));
                  });
                  argvPtrs.push(0);
                  keys = Object.keys(this.env).sort();
                  keys.forEach(function (key) {
                    argvPtrs.push(strPtr("".concat(key, "=").concat(_this2.env[key])));
                  });
                  argvPtrs.push(0);
                  argv = offset;
                  argvPtrs.forEach(function (ptr) {
                    _this2.mem.setUint32(offset, ptr, true);
                    _this2.mem.setUint32(offset + 4, 0, true);
                    offset += 8;
                  });

                  // The linker guarantees global data starts from at least wasmMinDataAddr.
                  // Keep in sync with cmd/link/internal/ld/data.go:wasmMinDataAddr.
                  wasmMinDataAddr = 4096 + 8192;
                  if (!(offset >= wasmMinDataAddr)) {
                    _context.next = 23;
                    break;
                  }
                  throw new Error("total length of command line and environment variables exceeds limit");
                case 23:
                  this._inst.exports.run(argc, argv);
                  if (this.exited) {
                    this._resolveExitPromise();
                  }
                  _context.next = 27;
                  return this._exitPromise;
                case 27:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function run(_x) {
            return _run.apply(this, arguments);
          }
          return run;
        }()
      }, {
        key: "_resume",
        value: function _resume() {
          if (this.exited) {
            throw new Error("Go program has already exited");
          }
          this._inst.exports.resume();
          if (this.exited) {
            this._resolveExitPromise();
          }
        }
      }, {
        key: "_makeFuncWrapper",
        value: function _makeFuncWrapper(id) {
          var go = this;
          return function () {
            var event = {
              id: id,
              this: this,
              args: arguments
            };
            go._pendingEvent = event;
            go._resume();
            return event.result;
          };
        }
      }]);
      return _class;
    }();
  })();

  var _commonjsHelpers$comm, _commonjsHelpers$comm2;
  (_commonjsHelpers$comm2 = (_commonjsHelpers$comm = commonjsGlobal).crypto) !== null && _commonjsHelpers$comm2 !== void 0 ? _commonjsHelpers$comm2 : _commonjsHelpers$comm.crypto = crypto__default["default"];

  // Include the wasm_exec.js file

  var wasmFilePath = path__default["default"].join(__dirname, 'main.wasm');
  var readFile = util__default["default"].promisify(fs__default["default"].readFile);
  function loadWasm() {
    return _loadWasm.apply(this, arguments);
  }
  function _loadWasm() {
    _loadWasm = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var wasmFile, go, wasmModule, wasmInstance, makeDid;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return readFile(wasmFilePath);
          case 2:
            wasmFile = _context.sent;
            // Instantiate the Go object
            go = new Go(); // Compile and instantiate the WASM module with the Go import object
            _context.next = 6;
            return WebAssembly.compile(wasmFile);
          case 6:
            wasmModule = _context.sent;
            _context.next = 9;
            return WebAssembly.instantiate(wasmModule, go.importObject);
          case 9:
            wasmInstance = _context.sent;
            // Run the Go instance
            go.run(wasmInstance);

            // Access the JavaScript function created in the Go code
            makeDid = commonjsGlobal.makeDid;
            return _context.abrupt("return", {
              makeDid: makeDid
            });
          case 13:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _loadWasm.apply(this, arguments);
  }
  var src = loadWasm;

  return src;

}));
