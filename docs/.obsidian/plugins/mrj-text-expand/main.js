'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

function formatContent(content) {
    return content.split('\n');
}
function getAllExpandersQuery(content) {
    var accum = [];
    for (var i = 0; i < content.length; i++) {
        var line = content[i];
        if (line === '```expander') {
            for (var e = 0; e < content.length - i; e++) {
                var nextline = content[i + e];
                if (nextline === '```') {
                    accum.push({
                        start: i,
                        end: i + e,
                        query: content[i + 1],
                        template: e > 2 ? content.slice(i + 2, i + e).join('\n') : ''
                    });
                    break;
                }
            }
        }
    }
    return accum;
}
function getClosestQuery(queries, lineNumber) {
    if (queries.length === 0) {
        return undefined;
    }
    return queries.reduce(function (a, b) {
        return Math.abs(b.start - lineNumber) < Math.abs(a.start - lineNumber) ? b : a;
    });
}
function getLastLineToReplace(content, query, endline) {
    var lineFrom = query.end;
    for (var i = lineFrom + 1; i < content.length; i++) {
        if (content[i] === endline) {
            return i;
        }
    }
    return lineFrom + 1;
}
function trimContent(s) {
    var removeEmptyLines = function (s) {
        var lines = s.split('\n').map(function (e) { return e.trim(); });
        if (lines.length < 2) {
            return s;
        }
        if (lines.indexOf('') === 0) {
            return removeEmptyLines(lines.slice(1).join('\n'));
        }
        return s;
    };
    var removeFrontMatter = function (s, lookEnding) {
        if (lookEnding === void 0) { lookEnding = false; }
        var lines = s.split('\n');
        if (lookEnding && lines.indexOf('---') === 0) {
            return lines.slice(1).join('\n');
        }
        if (lookEnding) {
            return removeFrontMatter(lines.slice(1).join('\n'), true);
        }
        if (lines.indexOf('---') === 0) {
            return removeFrontMatter(lines.slice(1).join('\n'), true);
        }
        return s;
    };
    return removeFrontMatter(removeEmptyLines(s));
}

var TextExpander = /** @class */ (function (_super) {
    __extends(TextExpander, _super);
    function TextExpander(app, plugin) {
        var _this = _super.call(this, app, plugin) || this;
        _this.config = {
            autoExpand: false,
            defaultTemplate: '- $link',
            delay: 5000,
            excludeCurrent: true,
            lineEnding: '<--->'
        };
        _this.seqs = [
            {
                name: '\\$filename',
                loop: true,
                format: function (_s, _content, file) { return file.basename; },
                desc: 'name of the founded file'
            },
            {
                name: '\\$link',
                loop: true,
                format: function (_s, _content, file) { return _this.app.fileManager.generateMarkdownLink(file, file.path); },
                desc: 'link based on Obsidian settings'
            },
            {
                name: '\\$lines:\\d+',
                loop: true,
                readContent: true,
                format: function (s, content, _file) {
                    var digits = Number(s.split(':')[1]);
                    return trimContent(content)
                        .split('\n')
                        .filter(function (_, i) { return i < digits; })
                        .join('\n')
                        .replace(new RegExp(_this.config.lineEnding, 'g'), '');
                },
                desc: 'specified count of lines from the found file'
            },
            {
                name: '\\$frontmatter:[\\p\{L\}_-]+',
                loop: true,
                format: function (s, _content, file) { return _this.getFrontMatter(s, file); },
                desc: 'value from the frontmatter key in the found file'
            },
            {
                name: '\\$lines+',
                loop: true,
                readContent: true,
                format: function (s, content, _file) { return content.replace(new RegExp(_this.config.lineEnding, 'g'), ''); },
                desc: 'all content from the found file'
            },
            {
                name: '\\$ext',
                loop: true,
                format: function (s, content, file) { return file.extension; },
                desc: 'return file extension'
            },
            {
                name: '\\$created',
                loop: true,
                format: function (s, content, file) { return String(file.stat.ctime); },
                desc: 'created time'
            },
            {
                name: '\\$size',
                loop: true,
                format: function (s, content, file) { return String(file.stat.size); },
                desc: 'size of the file'
            },
            {
                name: '\\$path',
                loop: true,
                format: function (s, content, file) { return file.path; },
                desc: 'path to the found file'
            },
            {
                name: '\\$parent',
                loop: true,
                format: function (s, content, file) { return file.parent.name; },
                desc: 'parent folder name'
            },
            {
                name: '^(.+|)\\$header:.+',
                loop: true,
                format: function (s, content, file) {
                    var _a;
                    var prefix = s.slice(0, s.indexOf('$'));
                    var header = s.slice(s.indexOf('$')).replace('$header:', '').replace(/"/g, '');
                    var neededLevel = header.split("#").length - 1;
                    var neededTitle = header.replace(/^#+/g, '').trim();
                    var metadata = _this.app.metadataCache.getFileCache(file);
                    return ((_a = metadata.headings) === null || _a === void 0 ? void 0 : _a.filter(function (e) {
                        var tests = [
                            [neededTitle, e.heading.includes(neededTitle)],
                            [neededLevel, e.level === neededLevel]
                        ].filter(function (e) { return e[0]; });
                        if (tests.length) {
                            return tests.map(function (e) { return e[1]; }).every(function (e) { return e === true; });
                        }
                        return true;
                    }).map(function (h) { return _this.app.fileManager.generateMarkdownLink(file, file.path, '#' + h.heading); }).map(function (link) { return prefix + link; }).join('\n')) || '';
                },
                desc: 'headings from founded files. $header:## - return all level 2 headings. $header:Title - return all heading which match the string. Can be prepended like: - !$header:## to transclude the headings.'
            },
            {
                name: '^(.+|)\\$blocks',
                readContent: true,
                loop: true,
                format: function (s, content, file) {
                    return content
                        .split('\n')
                        .filter(function (e) { return /\^\w+$/.test(e); })
                        .map(function (e) { return s
                        .replace('$blocks', "(" + encodeURIComponent(file.basename) + "#" + e.replace(/^.+?(\^\w+$)/, '$1') + ")"); })
                        .join('\n');
                },
                desc: 'block ids from the found files. Can be prepended.'
            },
            {
                name: '^(.+|)\\$match:header', loop: true,
                format: function (s, content, file, results) {
                    var _a;
                    var prefix = s.slice(0, s.indexOf('$'));
                    var metadata = _this.app.metadataCache.getFileCache(file);
                    var headings = (_a = metadata.headings) === null || _a === void 0 ? void 0 : _a.filter(function (h) { return results.result.content.filter(function (c) { return h.position.end.offset < c[0]; }).some(function (e) { return e; }); }).slice(-1);
                    return headings
                        .map(function (h) { return _this.app.fileManager.generateMarkdownLink(file, file.path, '#' + h.heading); })
                        .map(function (link) { return prefix + link; })
                        .join('\n') || '';
                },
                desc: 'extract found selections'
            },
            {
                name: '^(.+|)\\$match', loop: true,
                format: function (s, content, file, results) {
                    var _a;
                    var prefix = s.slice(0, s.indexOf('$'));
                    return (_a = results.result.content) === null || _a === void 0 ? void 0 : _a.map(function (t) {
                        var _a;
                        return (_a = results.content).slice.apply(_a, __spreadArray([], __read(t)));
                    }).map(function (t) { return prefix + t; }).join('\n');
                },
                desc: 'extract found selections'
            },
        ];
        _this.search = _this.search.bind(_this);
        _this.initExpander = _this.initExpander.bind(_this);
        _this.reformatLinks = _this.reformatLinks.bind(_this);
        return _this;
    }
    TextExpander.prototype.getFrontMatter = function (s, r) {
        var _a = this.app.metadataCache.getCache(r.path).frontmatter, frontmatter = _a === void 0 ? null : _a;
        if (frontmatter) {
            return frontmatter[s.split(':')[1]] || '';
        }
        return '';
    };
    TextExpander.prototype.reformatLinks = function (links, mapFunc) {
        var _a, _b, _c, _d;
        if (mapFunc === void 0) { mapFunc = function (s) { return '[[' + s + ']]'; }; }
        var currentView = this.app.workspace.activeLeaf.view;
        if (currentView instanceof obsidian.FileView) {
            return (_b = (_a = links === null || links === void 0 ? void 0 : links.map(function (e) { return e.basename; }).filter(function (e) { return currentView.file.basename !== e; })) === null || _a === void 0 ? void 0 : _a.map(mapFunc)) === null || _b === void 0 ? void 0 : _b.join('\n');
        }
        return (_d = (_c = links === null || links === void 0 ? void 0 : links.map(function (e) { return e.basename; })) === null || _c === void 0 ? void 0 : _c.map(mapFunc)) === null || _d === void 0 ? void 0 : _d.join('\n');
    };
    TextExpander.prototype.search = function (s) {
        // @ts-ignore
        var globalSearchFn = this.app.internalPlugins.getPluginById('global-search').instance.openGlobalSearch.bind(this);
        var search = function (query) { return globalSearchFn(query); };
        var leftSplitState = {
            // @ts-ignore
            collapsed: this.app.workspace.leftSplit.collapsed,
            // @ts-ignore
            tab: this.app.workspace.leftSplit.children[0].currentTab
        };
        search(s);
        if (leftSplitState.collapsed) {
            // @ts-ignore
            this.app.workspace.leftSplit.collapse();
        }
        // @ts-ignore
        if (leftSplitState.tab !== this.app.workspace.leftSplit.children[0].currentTab) {
            // @ts-ignore
            this.app.workspace.leftSplit.children[0].selectTabIndex(leftSplitState.tab);
        }
    };
    TextExpander.prototype.getFoundAfterDelay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var searchLeaf, view;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        searchLeaf = this.app.workspace.getLeavesOfType('search')[0];
                        return [4 /*yield*/, searchLeaf.open(searchLeaf.view)];
                    case 1:
                        view = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve) {
                                setTimeout(function () {
                                    // @ts-ignore
                                    var results = view.dom.resultDomLookup;
                                    return resolve(results);
                                }, _this.config.delay);
                            })];
                }
            });
        });
    };
    TextExpander.prototype.startTemplateMode = function (query, lastLine) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var currentView, currentFileName, templateContent, heading, footer, repeatableContent, searchResults, files, filterFiles, format, changed, result, viewBeforeReplace;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        currentView = this.app.workspace.activeLeaf.view;
                        currentFileName = '';
                        templateContent = query.template.split('\n');
                        heading = templateContent.filter(function (e) { return e[0] === '^'; }).map(function (s) { return s.slice(1); });
                        footer = templateContent.filter(function (e) { return e[0] === '>'; }).map(function (s) { return s.slice(1); });
                        repeatableContent = templateContent.filter(function (e) { return e[0] !== '^' && e[0] !== '>'; }).filter(function (e) { return e; }).length === 0
                            ? [this.config.defaultTemplate]
                            : templateContent.filter(function (e) { return e[0] !== '^' && e[0] !== '>'; }).filter(function (e) { return e; });
                        if (currentView instanceof obsidian.FileView) {
                            currentFileName = currentView.file.basename;
                        }
                        return [4 /*yield*/, this.getFoundAfterDelay()];
                    case 1:
                        searchResults = _b.sent();
                        files = Array.from(searchResults.keys());
                        filterFiles = this.config.excludeCurrent
                            ? files.filter(function (file) { return file.basename !== currentFileName; })
                            : files;
                        format = function (r, template) { return __awaiter(_this, void 0, void 0, function () {
                            var fileContent, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!(new RegExp(this.seqs.filter(function (e) { return e.readContent; }).map(function (e) { return e.name; }).join('|')).test(template))) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.app.vault.cachedRead(r)];
                                    case 1:
                                        _a = _b.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        _a = '';
                                        _b.label = 3;
                                    case 3:
                                        fileContent = _a;
                                        return [2 /*return*/, this.seqs.reduce(function (acc, seq) {
                                                return acc.replace(new RegExp(seq.name, 'gu'), function (replace) { return seq.format(replace, fileContent, r, searchResults.get(r)); });
                                            }, template)];
                                }
                            });
                        }); };
                        return [4 /*yield*/, Promise.all(filterFiles
                                .map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.all(repeatableContent.map(function (s) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, format(file, s)];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            }); }); }))];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.join('\n')];
                                    }
                                });
                            }); }))];
                    case 2:
                        changed = _b.sent();
                        result = [
                            ' ',
                            heading.join('\n'),
                            changed.join('\n'),
                            footer.join('\n'),
                            ' ',
                            this.config.lineEnding
                        ].filter(function (e) { return e; }).join('\n');
                        viewBeforeReplace = this.app.workspace.activeLeaf.view;
                        if (viewBeforeReplace instanceof obsidian.MarkdownView) {
                            if (viewBeforeReplace.file.basename !== currentFileName) {
                                return [2 /*return*/];
                            }
                        }
                        else {
                            return [2 /*return*/];
                        }
                        this.cm.replaceRange(result, { line: query.end + 1, ch: 0 }, { line: lastLine, ch: ((_a = this.cm.getLine(lastLine)) === null || _a === void 0 ? void 0 : _a.length) || 0 });
                        return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    TextExpander.prototype.runQuery = function (query, content) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var lastLine, newContent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!query) {
                            new Notification('Expand query not found');
                            return [2 /*return*/, Promise.resolve()];
                        }
                        lastLine = getLastLineToReplace(content, query, this.config.lineEnding);
                        this.cm.replaceRange(this.config.lineEnding, { line: query.end + 1, ch: 0 }, { line: lastLine, ch: ((_a = this.cm.getLine(lastLine)) === null || _a === void 0 ? void 0 : _a.length) || 0 });
                        newContent = formatContent(this.cm.getValue());
                        this.search(query.query);
                        return [4 /*yield*/, this.startTemplateMode(query, getLastLineToReplace(newContent, query, this.config.lineEnding))];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    TextExpander.prototype.initExpander = function (all) {
        var _this = this;
        if (all === void 0) { all = false; }
        var currentView = this.app.workspace.activeLeaf.view;
        if (!(currentView instanceof obsidian.MarkdownView)) {
            return;
        }
        var cmDoc = this.cm = currentView.sourceMode.cmEditor;
        var curNum = cmDoc.getCursor().line;
        var content = cmDoc.getValue();
        var formatted = formatContent(content);
        var findQueries = getAllExpandersQuery(formatted);
        var closestQuery = getClosestQuery(findQueries, curNum);
        if (all) {
            findQueries.reduce(function (promise, query, i) {
                return promise.then(function () {
                    var newContent = formatContent(cmDoc.getValue());
                    var updatedQueries = getAllExpandersQuery(newContent);
                    return _this.runQuery(updatedQueries[i], newContent);
                });
            }, Promise.resolve());
        }
        else {
            this.runQuery(closestQuery, formatted);
        }
    };
    TextExpander.prototype.onload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.addSettingTab(new SettingTab(this.app, this));
                        this.addCommand({
                            id: 'editor-expand',
                            name: 'expand',
                            callback: this.initExpander,
                            hotkeys: []
                        });
                        this.addCommand({
                            id: 'editor-expand-all',
                            name: 'expand all',
                            callback: function () { return _this.initExpander(true); },
                            hotkeys: []
                        });
                        this.app.workspace.on('file-open', function () { return __awaiter(_this, void 0, void 0, function () {
                            var activeLeaf, activeView, isAllowedView;
                            return __generator(this, function (_a) {
                                if (!this.config.autoExpand) {
                                    return [2 /*return*/];
                                }
                                activeLeaf = this.app.workspace.activeLeaf;
                                if (!activeLeaf) {
                                    return [2 /*return*/];
                                }
                                activeView = activeLeaf.view;
                                isAllowedView = activeView instanceof obsidian.MarkdownView;
                                if (!isAllowedView) {
                                    return [2 /*return*/];
                                }
                                this.initExpander(true);
                                return [2 /*return*/];
                            });
                        }); });
                        return [4 /*yield*/, this.loadData()];
                    case 1:
                        data = _a.sent();
                        if (data) {
                            this.config = __assign(__assign({}, this.config), data);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    TextExpander.prototype.onunload = function () {
        console.log('unloading plugin');
    };
    TextExpander.prototype.saveSettings = function () {
        this.saveData(this.config);
    };
    return TextExpander;
}(obsidian.Plugin));
var SettingTab = /** @class */ (function (_super) {
    __extends(SettingTab, _super);
    function SettingTab(app, plugin) {
        var _this = _super.call(this, app, plugin) || this;
        _this.app = app;
        _this.plugin = plugin;
        return _this;
    }
    SettingTab.prototype.display = function () {
        var _this = this;
        var containerEl = this.containerEl;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for Text Expander' });
        new obsidian.Setting(containerEl)
            .setName('Auto Expand')
            .setDesc('Expand all queries in a file once you open it')
            .addToggle(function (toggle) {
            toggle
                .setValue(_this.plugin.config.autoExpand)
                .onChange(function (value) {
                _this.plugin.config.autoExpand = value;
                _this.plugin.saveSettings();
            });
        });
        new obsidian.Setting(containerEl)
            .setName('Delay')
            .setDesc('Text expander don\' wait until search completed. It waits for a delay and paste result after that.')
            .addSlider(function (slider) {
            slider.setLimits(1000, 10000, 1000);
            slider.setValue(_this.plugin.config.delay);
            slider.onChange(function (value) {
                _this.plugin.config.delay = value;
                _this.plugin.saveSettings();
            });
            slider.setDynamicTooltip();
        });
        new obsidian.Setting(containerEl)
            .setName('Line ending')
            .setDesc('You can specify the text which will appear at the bottom of the generated text.')
            .addText(function (text) {
            text.setValue(_this.plugin.config.lineEnding)
                .onChange(function (val) {
                _this.plugin.config.lineEnding = val;
                _this.plugin.saveSettings();
            });
        });
        new obsidian.Setting(containerEl)
            .setName('Default template')
            .setDesc('You can specify default template')
            .addText(function (text) {
            text.setValue(_this.plugin.config.defaultTemplate)
                .onChange(function (val) {
                _this.plugin.config.defaultTemplate = val;
                _this.plugin.saveSettings();
            });
        });
        new obsidian.Setting(containerEl)
            .setName('Exclude current file')
            .setDesc('You can specify should text expander exclude results from current file or not')
            .addToggle(function (toggle) {
            toggle
                .setValue(_this.plugin.config.excludeCurrent)
                .onChange(function (value) {
                _this.plugin.config.excludeCurrent = value;
                _this.plugin.saveSettings();
            });
        });
        new obsidian.Setting(containerEl)
            .setName('Sequences')
            .setDesc('REGEXP - DESCRIPTION')
            .setDesc((function () {
            var fragment = new DocumentFragment();
            var div = fragment.createEl('div');
            _this.plugin.seqs
                .map(function (e) { return e.name + ' - ' + (e.desc || ''); })
                .map(function (e) {
                var el = fragment.createEl('div');
                el.setText(e);
                el.setAttribute('style', "\n                                border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n                                margin-bottom: 0.5rem;\n                                padding-bottom: 0.5rem;\n                            ");
                return el;
            }).forEach(function (el) {
                div.appendChild(el);
            });
            fragment.appendChild(div);
            return fragment;
        })());
    };
    return SettingTab;
}(obsidian.PluginSettingTab));

module.exports = TextExpander;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsImhlbHBlcnMudHMiLCJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBmcm9tLmxlbmd0aCwgaiA9IHRvLmxlbmd0aDsgaSA8IGlsOyBpKyssIGorKylcclxuICAgICAgICB0b1tqXSA9IGZyb21baV07XHJcbiAgICByZXR1cm4gdG87XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBnZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufVxyXG4iLCJleHBvcnQgaW50ZXJmYWNlIEV4cGFuZGVyUXVlcnkge1xuICAgIHN0YXJ0OiBudW1iZXJcbiAgICBlbmQ6IG51bWJlclxuICAgIHRlbXBsYXRlOiBzdHJpbmdcbiAgICBxdWVyeTogc3RyaW5nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRDb250ZW50KGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gY29udGVudC5zcGxpdCgnXFxuJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbEV4cGFuZGVyc1F1ZXJ5KGNvbnRlbnQ6IHN0cmluZ1tdKTogRXhwYW5kZXJRdWVyeVtdIHtcbiAgICBsZXQgYWNjdW06IEV4cGFuZGVyUXVlcnlbXSA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBjb250ZW50W2ldXG5cbiAgICAgICAgaWYgKGxpbmUgPT09ICdgYGBleHBhbmRlcicpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGUgPSAwOyBlIDwgY29udGVudC5sZW5ndGggLSBpOyBlKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0bGluZSA9IGNvbnRlbnRbaSArIGVdIFxuICAgICAgICAgICAgICAgIGlmIChuZXh0bGluZSA9PT0gJ2BgYCcpIHtcbiAgICAgICAgICAgICAgICAgICAgYWNjdW0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IGkgKyBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiBjb250ZW50W2kgKyAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogZSA+IDIgPyBjb250ZW50LnNsaWNlKGkgKyAyLCBpICsgZSkuam9pbignXFxuJykgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjY3VtXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbG9zZXN0UXVlcnkocXVlcmllczogRXhwYW5kZXJRdWVyeVtdLCBsaW5lTnVtYmVyOiBudW1iZXIpOiBFeHBhbmRlclF1ZXJ5IHwgdW5kZWZpbmVkIHtcbiAgICBpZiAocXVlcmllcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cblxuICAgIHJldHVybiBxdWVyaWVzLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnMoYi5zdGFydCAtIGxpbmVOdW1iZXIpIDwgTWF0aC5hYnMoYS5zdGFydCAtIGxpbmVOdW1iZXIpID8gYiA6IGE7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMYXN0TGluZVRvUmVwbGFjZShjb250ZW50OiBzdHJpbmdbXSwgcXVlcnk6IEV4cGFuZGVyUXVlcnksIGVuZGxpbmU6IHN0cmluZykge1xuICAgIGNvbnN0IGxpbmVGcm9tID0gcXVlcnkuZW5kXG5cbiAgICBmb3IgKHZhciBpID0gbGluZUZyb20gKyAxOyBpIDwgY29udGVudC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY29udGVudFtpXSA9PT0gZW5kbGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lRnJvbSArIDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyaW1Db250ZW50KHM6IHN0cmluZykge1xuICAgIGNvbnN0IHJlbW92ZUVtcHR5TGluZXMgPSAoczogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgY29uc3QgbGluZXMgPSBzLnNwbGl0KCdcXG4nKS5tYXAoZSA9PiBlLnRyaW0oKSlcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHJldHVybiBzXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGluZXMuaW5kZXhPZignJykgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVFbXB0eUxpbmVzKGxpbmVzLnNsaWNlKDEpLmpvaW4oJ1xcbicpKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNcbiAgICB9XG4gICAgY29uc3QgcmVtb3ZlRnJvbnRNYXR0ZXIgPSAoczogc3RyaW5nLCBsb29rRW5kaW5nOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcgPT4ge1xuICAgICAgICBjb25zdCBsaW5lcyA9IHMuc3BsaXQoJ1xcbicpXG5cbiAgICAgICAgaWYgKGxvb2tFbmRpbmcgJiYgbGluZXMuaW5kZXhPZignLS0tJykgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBsaW5lcy5zbGljZSgxKS5qb2luKCdcXG4nKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxvb2tFbmRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVGcm9udE1hdHRlcihsaW5lcy5zbGljZSgxKS5qb2luKCdcXG4nKSwgdHJ1ZSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaW5lcy5pbmRleE9mKCctLS0nKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbW92ZUZyb250TWF0dGVyKGxpbmVzLnNsaWNlKDEpLmpvaW4oJ1xcbicpLCB0cnVlKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNcbiAgICB9XG5cbiAgICByZXR1cm4gcmVtb3ZlRnJvbnRNYXR0ZXIocmVtb3ZlRW1wdHlMaW5lcyhzKSlcbn0iLCJpbXBvcnQge1xuICAgIEV4cGFuZGVyUXVlcnksXG4gICAgZm9ybWF0Q29udGVudCxcbiAgICBnZXRBbGxFeHBhbmRlcnNRdWVyeSxcbiAgICBnZXRDbG9zZXN0UXVlcnksXG4gICAgZ2V0TGFzdExpbmVUb1JlcGxhY2UsXG4gICAgdHJpbUNvbnRlbnRcbn0gZnJvbSAnaGVscGVycyc7XG5pbXBvcnQge1xuICAgIEFwcCxcbiAgICBQbHVnaW4sXG4gICAgUGx1Z2luU2V0dGluZ1RhYixcbiAgICBTZXR0aW5nLFxuICAgIFRGaWxlLFxuICAgIEZpbGVWaWV3LFxuICAgIE1hcmtkb3duVmlldyxcbiAgICBQbHVnaW5NYW5pZmVzdFxufSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgQ29kZU1pcnJvciBmcm9tICdjb2RlbWlycm9yJ1xuXG5pbnRlcmZhY2UgUGx1Z2luU2V0dGluZ3Mge1xuICAgIGRlbGF5OiBudW1iZXJcbiAgICBsaW5lRW5kaW5nOiBzdHJpbmdcbiAgICBkZWZhdWx0VGVtcGxhdGU6IHN0cmluZ1xuICAgIGV4Y2x1ZGVDdXJyZW50OiBib29sZWFuXG4gICAgYXV0b0V4cGFuZDogYm9vbGVhblxufVxuXG5pbnRlcmZhY2UgU2VxdWVuY2VzIHtcbiAgICBsb29wOiBib29sZWFuXG4gICAgbmFtZTogc3RyaW5nXG4gICAgZm9ybWF0OiAoczogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIGZpbGU6IFRGaWxlLCByZXN1bHRzPzogU2VhcmNoRGV0YWlscykgPT4gc3RyaW5nXG4gICAgZGVzYzogc3RyaW5nXG4gICAgcmVhZENvbnRlbnQ/OiBib29sZWFuXG4gICAgdXNpbmdTZWFyY2g/OiBib29sZWFuXG59XG5cbnR5cGUgTnVtYmVyVHVwbGUgPSBbbnVtYmVyLCBudW1iZXJdXG5cbmludGVyZmFjZSBTZWFyY2hEZXRhaWxzIHtcbiAgICBhcHA6IEFwcFxuICAgIGNoaWxkcmVuOiBhbnlbXVxuICAgIGNoaWxkcmVuRWw6IEhUTUxFbGVtZW50XG4gICAgY29sbGFwc2VFbDogSFRNTEVsZW1lbnRcbiAgICBjb2xsYXBzZWQ6IGJvb2xlYW5cbiAgICBjb2xsYXBzaWJsZTogYm9vbGVhblxuICAgIGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudFxuICAgIGNvbnRlbnQ6IHN0cmluZ1xuICAgIGRvbTogYW55XG4gICAgZWw6IEhUTUxFbGVtZW50XG4gICAgZXh0cmFDb250ZXh0OiAoKSA9PiBib29sZWFuXG4gICAgZmlsZTogVEZpbGVcbiAgICBpbmZvOiBhbnlcbiAgICBvbk1hdGNoUmVuZGVyOiBhbnlcbiAgICBwdXNoZXJFbDogSFRNTEVsZW1lbnRcbiAgICByZXN1bHQ6IHtcbiAgICAgICAgZmlsZW5hbWU/OiBOdW1iZXJUdXBsZVtdXG4gICAgICAgIGNvbnRlbnQ/OiBOdW1iZXJUdXBsZVtdXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0RXhwYW5kZXIgZXh0ZW5kcyBQbHVnaW4ge1xuICAgIGNtOiBDb2RlTWlycm9yLkVkaXRvclxuXG4gICAgY29uZmlnOiBQbHVnaW5TZXR0aW5ncyA9IHtcbiAgICAgICAgYXV0b0V4cGFuZDogZmFsc2UsXG4gICAgICAgIGRlZmF1bHRUZW1wbGF0ZTogJy0gJGxpbmsnLFxuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgZXhjbHVkZUN1cnJlbnQ6IHRydWUsXG4gICAgICAgIGxpbmVFbmRpbmc6ICc8LS0tPidcbiAgICB9XG5cbiAgICBzZXFzOiBTZXF1ZW5jZXNbXSA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1xcXFwkZmlsZW5hbWUnLFxuICAgICAgICAgICAgbG9vcDogdHJ1ZSxcbiAgICAgICAgICAgIGZvcm1hdDogKF9zOiBzdHJpbmcsIF9jb250ZW50OiBzdHJpbmcsIGZpbGU6IFRGaWxlKSA9PiBmaWxlLmJhc2VuYW1lLFxuICAgICAgICAgICAgZGVzYzogJ25hbWUgb2YgdGhlIGZvdW5kZWQgZmlsZSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1xcXFwkbGluaycsXG4gICAgICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICAgICAgZm9ybWF0OiAoX3M6IHN0cmluZywgX2NvbnRlbnQ6IHN0cmluZywgZmlsZTogVEZpbGUpID0+IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLmdlbmVyYXRlTWFya2Rvd25MaW5rKGZpbGUsIGZpbGUucGF0aCksXG4gICAgICAgICAgICBkZXNjOiAnbGluayBiYXNlZCBvbiBPYnNpZGlhbiBzZXR0aW5ncydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1xcXFwkbGluZXM6XFxcXGQrJyxcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICByZWFkQ29udGVudDogdHJ1ZSxcbiAgICAgICAgICAgIGZvcm1hdDogKHM6IHN0cmluZywgY29udGVudDogc3RyaW5nLCBfZmlsZTogVEZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkaWdpdHMgPSBOdW1iZXIocy5zcGxpdCgnOicpWzFdKVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyaW1Db250ZW50KGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoXzogc3RyaW5nLCBpOiBudW1iZXIpID0+IGkgPCBkaWdpdHMpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHRoaXMuY29uZmlnLmxpbmVFbmRpbmcsICdnJyksICcnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlc2M6ICdzcGVjaWZpZWQgY291bnQgb2YgbGluZXMgZnJvbSB0aGUgZm91bmQgZmlsZSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1xcXFwkZnJvbnRtYXR0ZXI6W1xcXFxwXFx7TFxcfV8tXSsnLFxuICAgICAgICAgICAgbG9vcDogdHJ1ZSxcbiAgICAgICAgICAgIGZvcm1hdDogKHM6IHN0cmluZywgX2NvbnRlbnQ6IHN0cmluZywgZmlsZTogVEZpbGUpID0+IHRoaXMuZ2V0RnJvbnRNYXR0ZXIocywgZmlsZSksXG4gICAgICAgICAgICBkZXNjOiAndmFsdWUgZnJvbSB0aGUgZnJvbnRtYXR0ZXIga2V5IGluIHRoZSBmb3VuZCBmaWxlJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnXFxcXCRsaW5lcysnLFxuICAgICAgICAgICAgbG9vcDogdHJ1ZSxcbiAgICAgICAgICAgIHJlYWRDb250ZW50OiB0cnVlLFxuICAgICAgICAgICAgZm9ybWF0OiAoczogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIF9maWxlOiBURmlsZSkgPT4gY29udGVudC5yZXBsYWNlKG5ldyBSZWdFeHAodGhpcy5jb25maWcubGluZUVuZGluZywgJ2cnKSwgJycpLFxuICAgICAgICAgICAgZGVzYzogJ2FsbCBjb250ZW50IGZyb20gdGhlIGZvdW5kIGZpbGUnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdcXFxcJGV4dCcsXG4gICAgICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICAgICAgZm9ybWF0OiAoczogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIGZpbGU6IFRGaWxlKSA9PiBmaWxlLmV4dGVuc2lvbixcbiAgICAgICAgICAgIGRlc2M6ICdyZXR1cm4gZmlsZSBleHRlbnNpb24nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdcXFxcJGNyZWF0ZWQnLFxuICAgICAgICAgICAgbG9vcDogdHJ1ZSxcbiAgICAgICAgICAgIGZvcm1hdDogKHM6IHN0cmluZywgY29udGVudDogc3RyaW5nLCBmaWxlOiBURmlsZSkgPT4gU3RyaW5nKGZpbGUuc3RhdC5jdGltZSksXG4gICAgICAgICAgICBkZXNjOiAnY3JlYXRlZCB0aW1lJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnXFxcXCRzaXplJyxcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICBmb3JtYXQ6IChzOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgZmlsZTogVEZpbGUpID0+IFN0cmluZyhmaWxlLnN0YXQuc2l6ZSksXG4gICAgICAgICAgICBkZXNjOiAnc2l6ZSBvZiB0aGUgZmlsZSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1xcXFwkcGF0aCcsXG4gICAgICAgICAgICBsb29wOiB0cnVlLFxuICAgICAgICAgICAgZm9ybWF0OiAoczogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIGZpbGU6IFRGaWxlKSA9PiBmaWxlLnBhdGgsXG4gICAgICAgICAgICBkZXNjOiAncGF0aCB0byB0aGUgZm91bmQgZmlsZSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1xcXFwkcGFyZW50JyxcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICBmb3JtYXQ6IChzOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgZmlsZTogVEZpbGUpID0+IGZpbGUucGFyZW50Lm5hbWUsXG4gICAgICAgICAgICBkZXNjOiAncGFyZW50IGZvbGRlciBuYW1lJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnXiguK3wpXFxcXCRoZWFkZXI6LisnLFxuICAgICAgICAgICAgbG9vcDogdHJ1ZSxcbiAgICAgICAgICAgIGZvcm1hdDogKHM6IHN0cmluZywgY29udGVudDogc3RyaW5nLCBmaWxlOiBURmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IHMuc2xpY2UoMCwgcy5pbmRleE9mKCckJykpXG4gICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gcy5zbGljZShzLmluZGV4T2YoJyQnKSkucmVwbGFjZSgnJGhlYWRlcjonLCAnJykucmVwbGFjZSgvXCIvZywgJycpXG4gICAgICAgICAgICAgICAgY29uc3QgbmVlZGVkTGV2ZWwgPSBoZWFkZXIuc3BsaXQoXCIjXCIpLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgICBjb25zdCBuZWVkZWRUaXRsZSA9IGhlYWRlci5yZXBsYWNlKC9eIysvZywgJycpLnRyaW0oKVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGFkYXRhLmhlYWRpbmdzPy5maWx0ZXIoZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlc3RzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgW25lZWRlZFRpdGxlLCBlLmhlYWRpbmcuaW5jbHVkZXMobmVlZGVkVGl0bGUpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtuZWVkZWRMZXZlbCwgZS5sZXZlbCA9PT0gbmVlZGVkTGV2ZWxdXG4gICAgICAgICAgICAgICAgICAgIF0uZmlsdGVyKGUgPT4gZVswXSlcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGVzdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdHMubWFwKGUgPT4gZVsxXSkuZXZlcnkoZSA9PiBlID09PSB0cnVlKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAubWFwKGggPT4gdGhpcy5hcHAuZmlsZU1hbmFnZXIuZ2VuZXJhdGVNYXJrZG93bkxpbmsoZmlsZSwgZmlsZS5wYXRoLCAnIycgKyBoLmhlYWRpbmcpKVxuICAgICAgICAgICAgICAgICAgICAubWFwKGxpbmsgPT4gcHJlZml4ICsgbGluaylcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpIHx8ICcnXG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXNjOiAnaGVhZGluZ3MgZnJvbSBmb3VuZGVkIGZpbGVzLiAkaGVhZGVyOiMjIC0gcmV0dXJuIGFsbCBsZXZlbCAyIGhlYWRpbmdzLiAkaGVhZGVyOlRpdGxlIC0gcmV0dXJuIGFsbCBoZWFkaW5nIHdoaWNoIG1hdGNoIHRoZSBzdHJpbmcuIENhbiBiZSBwcmVwZW5kZWQgbGlrZTogLSAhJGhlYWRlcjojIyB0byB0cmFuc2NsdWRlIHRoZSBoZWFkaW5ncy4nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdeKC4rfClcXFxcJGJsb2NrcycsXG4gICAgICAgICAgICByZWFkQ29udGVudDogdHJ1ZSxcbiAgICAgICAgICAgIGxvb3A6IHRydWUsXG4gICAgICAgICAgICBmb3JtYXQ6IChzOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgZmlsZTogVEZpbGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudFxuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZSA9PiAvXFxeXFx3KyQvLnRlc3QoZSkpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoZSA9PiBzXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJGJsb2NrcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCgke2VuY29kZVVSSUNvbXBvbmVudChmaWxlLmJhc2VuYW1lKX0jJHtlLnJlcGxhY2UoL14uKz8oXFxeXFx3KyQpLywgJyQxJyl9KWBcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlc2M6ICdibG9jayBpZHMgZnJvbSB0aGUgZm91bmQgZmlsZXMuIENhbiBiZSBwcmVwZW5kZWQuJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnXiguK3wpXFxcXCRtYXRjaDpoZWFkZXInLCBsb29wOiB0cnVlLCBmb3JtYXQ6IChzOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgZmlsZTogVEZpbGUsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmaXggPSBzLnNsaWNlKDAsIHMuaW5kZXhPZignJCcpKVxuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSlcblxuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRpbmdzID0gbWV0YWRhdGEuaGVhZGluZ3NcbiAgICAgICAgICAgICAgICAgICAgPy5maWx0ZXIoaCA9PiByZXN1bHRzLnJlc3VsdC5jb250ZW50LmZpbHRlcihjID0+IGgucG9zaXRpb24uZW5kLm9mZnNldCA8IGNbMF0pLnNvbWUoZSA9PiBlKSlcbiAgICAgICAgICAgICAgICAgICAgLnNsaWNlKC0xKVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlYWRpbmdzXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoaCA9PiB0aGlzLmFwcC5maWxlTWFuYWdlci5nZW5lcmF0ZU1hcmtkb3duTGluayhmaWxlLCBmaWxlLnBhdGgsICcjJyArIGguaGVhZGluZykpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAobGluayA9PiBwcmVmaXggKyBsaW5rKVxuICAgICAgICAgICAgICAgICAgICAuam9pbignXFxuJykgfHwgJydcbiAgICAgICAgICAgIH0sIGRlc2M6ICdleHRyYWN0IGZvdW5kIHNlbGVjdGlvbnMnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdeKC4rfClcXFxcJG1hdGNoJywgbG9vcDogdHJ1ZSwgZm9ybWF0OiAoczogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIGZpbGU6IFRGaWxlLCByZXN1bHRzKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmaXggPSBzLnNsaWNlKDAsIHMuaW5kZXhPZignJCcpKVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzLnJlc3VsdC5jb250ZW50Py5tYXAodCA9PiByZXN1bHRzLmNvbnRlbnQuc2xpY2UoLi4udCkpLm1hcCh0ID0+IHByZWZpeCArIHQpLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICB9LCBkZXNjOiAnZXh0cmFjdCBmb3VuZCBzZWxlY3Rpb25zJ1xuICAgICAgICB9LFxuICAgIF1cblxuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFBsdWdpbk1hbmlmZXN0KSB7XG4gICAgICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcblxuICAgICAgICB0aGlzLnNlYXJjaCA9IHRoaXMuc2VhcmNoLmJpbmQodGhpcylcbiAgICAgICAgdGhpcy5pbml0RXhwYW5kZXIgPSB0aGlzLmluaXRFeHBhbmRlci5iaW5kKHRoaXMpXG4gICAgICAgIHRoaXMucmVmb3JtYXRMaW5rcyA9IHRoaXMucmVmb3JtYXRMaW5rcy5iaW5kKHRoaXMpXG4gICAgfVxuXG4gICAgZ2V0RnJvbnRNYXR0ZXIoczogc3RyaW5nLCByOiBURmlsZSkge1xuICAgICAgICBjb25zdCB7ZnJvbnRtYXR0ZXIgPSBudWxsfSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUoci5wYXRoKVxuXG4gICAgICAgIGlmIChmcm9udG1hdHRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGZyb250bWF0dGVyW3Muc3BsaXQoJzonKVsxXV0gfHwgJyc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJydcbiAgICB9XG5cbiAgICByZWZvcm1hdExpbmtzKGxpbmtzOiBURmlsZVtdLCBtYXBGdW5jID0gKHM6IHN0cmluZykgPT4gJ1tbJyArIHMgKyAnXV0nKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmFjdGl2ZUxlYWYudmlld1xuXG4gICAgICAgIGlmIChjdXJyZW50VmlldyBpbnN0YW5jZW9mIEZpbGVWaWV3KSB7XG4gICAgICAgICAgICByZXR1cm4gbGlua3M/Lm1hcChlID0+IGUuYmFzZW5hbWUpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihlID0+IGN1cnJlbnRWaWV3LmZpbGUuYmFzZW5hbWUgIT09IGUpXG4gICAgICAgICAgICAgICAgPy5tYXAobWFwRnVuYyk/LmpvaW4oJ1xcbicpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGlua3M/Lm1hcChlID0+IGUuYmFzZW5hbWUpPy5tYXAobWFwRnVuYyk/LmpvaW4oJ1xcbicpXG4gICAgfVxuXG4gICAgc2VhcmNoKHM6IHN0cmluZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNvbnN0IGdsb2JhbFNlYXJjaEZuID0gdGhpcy5hcHAuaW50ZXJuYWxQbHVnaW5zLmdldFBsdWdpbkJ5SWQoJ2dsb2JhbC1zZWFyY2gnKS5pbnN0YW5jZS5vcGVuR2xvYmFsU2VhcmNoLmJpbmQodGhpcylcbiAgICAgICAgY29uc3Qgc2VhcmNoID0gKHF1ZXJ5OiBzdHJpbmcpID0+IGdsb2JhbFNlYXJjaEZuKHF1ZXJ5KVxuXG4gICAgICAgIGNvbnN0IGxlZnRTcGxpdFN0YXRlID0ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29sbGFwc2VkOiB0aGlzLmFwcC53b3Jrc3BhY2UubGVmdFNwbGl0LmNvbGxhcHNlZCxcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHRhYjogdGhpcy5hcHAud29ya3NwYWNlLmxlZnRTcGxpdC5jaGlsZHJlblswXS5jdXJyZW50VGFiXG4gICAgICAgIH1cblxuICAgICAgICBzZWFyY2gocylcbiAgICAgICAgaWYgKGxlZnRTcGxpdFN0YXRlLmNvbGxhcHNlZCkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmxlZnRTcGxpdC5jb2xsYXBzZSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChsZWZ0U3BsaXRTdGF0ZS50YWIgIT09IHRoaXMuYXBwLndvcmtzcGFjZS5sZWZ0U3BsaXQuY2hpbGRyZW5bMF0uY3VycmVudFRhYikge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmxlZnRTcGxpdC5jaGlsZHJlblswXS5zZWxlY3RUYWJJbmRleChsZWZ0U3BsaXRTdGF0ZS50YWIpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBnZXRGb3VuZEFmdGVyRGVsYXkoKTogUHJvbWlzZTxNYXA8VEZpbGUsIFNlYXJjaERldGFpbHM+PiB7XG4gICAgICAgIGNvbnN0IHNlYXJjaExlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKCdzZWFyY2gnKVswXVxuICAgICAgICBjb25zdCB2aWV3ID0gYXdhaXQgc2VhcmNoTGVhZi5vcGVuKHNlYXJjaExlYWYudmlldylcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSB2aWV3LmRvbS5yZXN1bHREb21Mb29rdXAgYXMgTWFwPFRGaWxlLCBTZWFyY2hEZXRhaWxzPlxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUocmVzdWx0cylcbiAgICAgICAgICAgIH0sIHRoaXMuY29uZmlnLmRlbGF5KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGFzeW5jIHN0YXJ0VGVtcGxhdGVNb2RlKHF1ZXJ5OiBFeHBhbmRlclF1ZXJ5LCBsYXN0TGluZTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmFjdGl2ZUxlYWYudmlld1xuICAgICAgICBsZXQgY3VycmVudEZpbGVOYW1lID0gJydcblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUNvbnRlbnQgPSBxdWVyeS50ZW1wbGF0ZS5zcGxpdCgnXFxuJylcblxuICAgICAgICBjb25zdCBoZWFkaW5nID0gdGVtcGxhdGVDb250ZW50LmZpbHRlcihlID0+IGVbMF0gPT09ICdeJykubWFwKChzKSA9PiBzLnNsaWNlKDEpKVxuICAgICAgICBjb25zdCBmb290ZXIgPSB0ZW1wbGF0ZUNvbnRlbnQuZmlsdGVyKGUgPT4gZVswXSA9PT0gJz4nKS5tYXAoKHMpID0+IHMuc2xpY2UoMSkpXG4gICAgICAgIGNvbnN0IHJlcGVhdGFibGVDb250ZW50ID1cbiAgICAgICAgICAgIHRlbXBsYXRlQ29udGVudC5maWx0ZXIoZSA9PiBlWzBdICE9PSAnXicgJiYgZVswXSAhPT0gJz4nKS5maWx0ZXIoZSA9PiBlKS5sZW5ndGggPT09IDBcbiAgICAgICAgICAgICAgICA/IFt0aGlzLmNvbmZpZy5kZWZhdWx0VGVtcGxhdGVdXG4gICAgICAgICAgICAgICAgOiB0ZW1wbGF0ZUNvbnRlbnQuZmlsdGVyKGUgPT4gZVswXSAhPT0gJ14nICYmIGVbMF0gIT09ICc+JykuZmlsdGVyKGUgPT4gZSlcblxuICAgICAgICBpZiAoY3VycmVudFZpZXcgaW5zdGFuY2VvZiBGaWxlVmlldykge1xuICAgICAgICAgICAgY3VycmVudEZpbGVOYW1lID0gY3VycmVudFZpZXcuZmlsZS5iYXNlbmFtZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VhcmNoUmVzdWx0cyA9IGF3YWl0IHRoaXMuZ2V0Rm91bmRBZnRlckRlbGF5KClcbiAgICAgICAgY29uc3QgZmlsZXMgPSBBcnJheS5mcm9tKHNlYXJjaFJlc3VsdHMua2V5cygpKVxuXG4gICAgICAgIGNvbnN0IGZpbHRlckZpbGVzID0gdGhpcy5jb25maWcuZXhjbHVkZUN1cnJlbnRcbiAgICAgICAgICAgID8gZmlsZXMuZmlsdGVyKGZpbGUgPT4gZmlsZS5iYXNlbmFtZSAhPT0gY3VycmVudEZpbGVOYW1lKVxuICAgICAgICAgICAgOiBmaWxlc1xuXG4gICAgICAgIGNvbnN0IGZvcm1hdCA9IGFzeW5jIChyOiBURmlsZSwgdGVtcGxhdGU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSAobmV3IFJlZ0V4cCh0aGlzLnNlcXMuZmlsdGVyKGUgPT4gZS5yZWFkQ29udGVudCkubWFwKGUgPT4gZS5uYW1lKS5qb2luKCd8JykpLnRlc3QodGVtcGxhdGUpKVxuICAgICAgICAgICAgICAgID8gYXdhaXQgdGhpcy5hcHAudmF1bHQuY2FjaGVkUmVhZChyKVxuICAgICAgICAgICAgICAgIDogJydcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2Vxcy5yZWR1Y2UoKGFjYywgc2VxKSA9PlxuICAgICAgICAgICAgICAgIGFjYy5yZXBsYWNlKG5ldyBSZWdFeHAoc2VxLm5hbWUsICdndScpLCByZXBsYWNlID0+IHNlcS5mb3JtYXQocmVwbGFjZSwgZmlsZUNvbnRlbnQsIHIsIHNlYXJjaFJlc3VsdHMuZ2V0KHIpKSksIHRlbXBsYXRlKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hhbmdlZCA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICAgICAgZmlsdGVyRmlsZXNcbiAgICAgICAgICAgICAgICAubWFwKGFzeW5jIChmaWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFByb21pc2UuYWxsKHJlcGVhdGFibGVDb250ZW50Lm1hcChhc3luYyAocykgPT4gYXdhaXQgZm9ybWF0KGZpbGUsIHMpKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCdcXG4nKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIClcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBbXG4gICAgICAgICAgICAnICcsXG4gICAgICAgICAgICBoZWFkaW5nLmpvaW4oJ1xcbicpLFxuICAgICAgICAgICAgY2hhbmdlZC5qb2luKCdcXG4nKSxcbiAgICAgICAgICAgIGZvb3Rlci5qb2luKCdcXG4nKSxcbiAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLmxpbmVFbmRpbmdcbiAgICAgICAgXS5maWx0ZXIoZSA9PiBlKS5qb2luKCdcXG4nKVxuXG4gICAgICAgIGNvbnN0IHZpZXdCZWZvcmVSZXBsYWNlID0gdGhpcy5hcHAud29ya3NwYWNlLmFjdGl2ZUxlYWYudmlld1xuICAgICAgICBpZiAodmlld0JlZm9yZVJlcGxhY2UgaW5zdGFuY2VvZiBNYXJrZG93blZpZXcpIHtcbiAgICAgICAgICAgIGlmICh2aWV3QmVmb3JlUmVwbGFjZS5maWxlLmJhc2VuYW1lICE9PSBjdXJyZW50RmlsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbS5yZXBsYWNlUmFuZ2UocmVzdWx0LFxuICAgICAgICAgICAge2xpbmU6IHF1ZXJ5LmVuZCArIDEsIGNoOiAwfSxcbiAgICAgICAgICAgIHtsaW5lOiBsYXN0TGluZSwgY2g6IHRoaXMuY20uZ2V0TGluZShsYXN0TGluZSk/Lmxlbmd0aCB8fCAwfSlcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9XG5cbiAgICBhc3luYyBydW5RdWVyeShxdWVyeTogRXhwYW5kZXJRdWVyeSwgY29udGVudDogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKCFxdWVyeSkge1xuICAgICAgICAgICAgbmV3IE5vdGlmaWNhdGlvbignRXhwYW5kIHF1ZXJ5IG5vdCBmb3VuZCcpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsYXN0TGluZSA9IGdldExhc3RMaW5lVG9SZXBsYWNlKGNvbnRlbnQsIHF1ZXJ5LCB0aGlzLmNvbmZpZy5saW5lRW5kaW5nKVxuICAgICAgICB0aGlzLmNtLnJlcGxhY2VSYW5nZSh0aGlzLmNvbmZpZy5saW5lRW5kaW5nLFxuICAgICAgICAgICAge2xpbmU6IHF1ZXJ5LmVuZCArIDEsIGNoOiAwfSxcbiAgICAgICAgICAgIHtsaW5lOiBsYXN0TGluZSwgY2g6IHRoaXMuY20uZ2V0TGluZShsYXN0TGluZSk/Lmxlbmd0aCB8fCAwfSlcblxuICAgICAgICBjb25zdCBuZXdDb250ZW50ID0gZm9ybWF0Q29udGVudCh0aGlzLmNtLmdldFZhbHVlKCkpXG5cbiAgICAgICAgdGhpcy5zZWFyY2gocXVlcnkucXVlcnkpXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YXJ0VGVtcGxhdGVNb2RlKHF1ZXJ5LCBnZXRMYXN0TGluZVRvUmVwbGFjZShuZXdDb250ZW50LCBxdWVyeSwgdGhpcy5jb25maWcubGluZUVuZGluZykpXG4gICAgfVxuXG4gICAgaW5pdEV4cGFuZGVyKGFsbCA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWaWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmFjdGl2ZUxlYWYudmlld1xuXG4gICAgICAgIGlmICghKGN1cnJlbnRWaWV3IGluc3RhbmNlb2YgTWFya2Rvd25WaWV3KSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbURvYyA9IHRoaXMuY20gPSBjdXJyZW50Vmlldy5zb3VyY2VNb2RlLmNtRWRpdG9yXG4gICAgICAgIGNvbnN0IGN1ck51bSA9IGNtRG9jLmdldEN1cnNvcigpLmxpbmVcbiAgICAgICAgY29uc3QgY29udGVudCA9IGNtRG9jLmdldFZhbHVlKClcblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSBmb3JtYXRDb250ZW50KGNvbnRlbnQpXG4gICAgICAgIGxldCBmaW5kUXVlcmllcyA9IGdldEFsbEV4cGFuZGVyc1F1ZXJ5KGZvcm1hdHRlZClcbiAgICAgICAgY29uc3QgY2xvc2VzdFF1ZXJ5ID0gZ2V0Q2xvc2VzdFF1ZXJ5KGZpbmRRdWVyaWVzLCBjdXJOdW0pXG5cbiAgICAgICAgaWYgKGFsbCkge1xuICAgICAgICAgICAgZmluZFF1ZXJpZXMucmVkdWNlKChwcm9taXNlLCBxdWVyeSwgaSkgPT5cbiAgICAgICAgICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdDb250ZW50ID0gZm9ybWF0Q29udGVudChjbURvYy5nZXRWYWx1ZSgpKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkUXVlcmllcyA9IGdldEFsbEV4cGFuZGVyc1F1ZXJ5KG5ld0NvbnRlbnQpXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucnVuUXVlcnkodXBkYXRlZFF1ZXJpZXNbaV0sIG5ld0NvbnRlbnQpXG4gICAgICAgICAgICAgICAgfSksIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJ1blF1ZXJ5KGNsb3Nlc3RRdWVyeSwgZm9ybWF0dGVkKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgb25sb2FkKCkge1xuICAgICAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgICAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgICAgICAgaWQ6ICdlZGl0b3ItZXhwYW5kJyxcbiAgICAgICAgICAgIG5hbWU6ICdleHBhbmQnLFxuICAgICAgICAgICAgY2FsbGJhY2s6IHRoaXMuaW5pdEV4cGFuZGVyLFxuICAgICAgICAgICAgaG90a2V5czogW11cbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgICAgICAgaWQ6ICdlZGl0b3ItZXhwYW5kLWFsbCcsXG4gICAgICAgICAgICBuYW1lOiAnZXhwYW5kIGFsbCcsXG4gICAgICAgICAgICBjYWxsYmFjazogKCkgPT4gdGhpcy5pbml0RXhwYW5kZXIodHJ1ZSksXG4gICAgICAgICAgICBob3RrZXlzOiBbXVxuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbignZmlsZS1vcGVuJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5hdXRvRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZUxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuYWN0aXZlTGVhZlxuICAgICAgICAgICAgaWYgKCFhY3RpdmVMZWFmKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVZpZXcgPSBhY3RpdmVMZWFmLnZpZXdcbiAgICAgICAgICAgIGNvbnN0IGlzQWxsb3dlZFZpZXcgPSBhY3RpdmVWaWV3IGluc3RhbmNlb2YgTWFya2Rvd25WaWV3XG4gICAgICAgICAgICBpZiAoIWlzQWxsb3dlZFZpZXcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pbml0RXhwYW5kZXIodHJ1ZSlcblxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmxvYWREYXRhKCkgYXMgUGx1Z2luU2V0dGluZ3NcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuY29uZmlnLFxuICAgICAgICAgICAgICAgIC4uLmRhdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9udW5sb2FkKCkge1xuICAgICAgICBjb25zb2xlLmxvZygndW5sb2FkaW5nIHBsdWdpbicpO1xuICAgIH1cblxuICAgIHNhdmVTZXR0aW5ncygpIHtcbiAgICAgICAgdGhpcy5zYXZlRGF0YSh0aGlzLmNvbmZpZylcbiAgICB9XG59XG5cbmNsYXNzIFNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgICBwbHVnaW46IFRleHRFeHBhbmRlclxuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogVGV4dEV4cGFuZGVyKSB7XG4gICAgICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcblxuICAgICAgICB0aGlzLmFwcCA9IGFwcFxuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpblxuICAgIH1cblxuICAgIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgICAgIGxldCB7Y29udGFpbmVyRWx9ID0gdGhpcztcblxuICAgICAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHt0ZXh0OiAnU2V0dGluZ3MgZm9yIFRleHQgRXhwYW5kZXInfSk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZSgnQXV0byBFeHBhbmQnKVxuICAgICAgICAgICAgLnNldERlc2MoJ0V4cGFuZCBhbGwgcXVlcmllcyBpbiBhIGZpbGUgb25jZSB5b3Ugb3BlbiBpdCcpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5jb25maWcuYXV0b0V4cGFuZClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmNvbmZpZy5hdXRvRXhwYW5kID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoJ0RlbGF5JylcbiAgICAgICAgICAgIC5zZXREZXNjKCdUZXh0IGV4cGFuZGVyIGRvblxcJyB3YWl0IHVudGlsIHNlYXJjaCBjb21wbGV0ZWQuIEl0IHdhaXRzIGZvciBhIGRlbGF5IGFuZCBwYXN0ZSByZXN1bHQgYWZ0ZXIgdGhhdC4nKVxuICAgICAgICAgICAgLmFkZFNsaWRlcihzbGlkZXIgPT4ge1xuICAgICAgICAgICAgICAgIHNsaWRlci5zZXRMaW1pdHMoMTAwMCwgMTAwMDAsIDEwMDApXG4gICAgICAgICAgICAgICAgc2xpZGVyLnNldFZhbHVlKHRoaXMucGx1Z2luLmNvbmZpZy5kZWxheSlcbiAgICAgICAgICAgICAgICBzbGlkZXIub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5jb25maWcuZGVsYXkgPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgc2xpZGVyLnNldER5bmFtaWNUb29sdGlwKClcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZSgnTGluZSBlbmRpbmcnKVxuICAgICAgICAgICAgLnNldERlc2MoJ1lvdSBjYW4gc3BlY2lmeSB0aGUgdGV4dCB3aGljaCB3aWxsIGFwcGVhciBhdCB0aGUgYm90dG9tIG9mIHRoZSBnZW5lcmF0ZWQgdGV4dC4nKVxuICAgICAgICAgICAgLmFkZFRleHQodGV4dCA9PiB7XG4gICAgICAgICAgICAgICAgdGV4dC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5jb25maWcubGluZUVuZGluZylcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKHZhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5jb25maWcubGluZUVuZGluZyA9IHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZSgnRGVmYXVsdCB0ZW1wbGF0ZScpXG4gICAgICAgICAgICAuc2V0RGVzYygnWW91IGNhbiBzcGVjaWZ5IGRlZmF1bHQgdGVtcGxhdGUnKVxuICAgICAgICAgICAgLmFkZFRleHQodGV4dCA9PiB7XG4gICAgICAgICAgICAgICAgdGV4dC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5jb25maWcuZGVmYXVsdFRlbXBsYXRlKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UodmFsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmNvbmZpZy5kZWZhdWx0VGVtcGxhdGUgPSB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoJ0V4Y2x1ZGUgY3VycmVudCBmaWxlJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdZb3UgY2FuIHNwZWNpZnkgc2hvdWxkIHRleHQgZXhwYW5kZXIgZXhjbHVkZSByZXN1bHRzIGZyb20gY3VycmVudCBmaWxlIG9yIG5vdCcpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5jb25maWcuZXhjbHVkZUN1cnJlbnQpXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5jb25maWcuZXhjbHVkZUN1cnJlbnQgPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZSgnU2VxdWVuY2VzJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdSRUdFWFAgLSBERVNDUklQVElPTicpXG4gICAgICAgICAgICAuc2V0RGVzYyhcbiAgICAgICAgICAgICAgICAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcmFnbWVudCA9IG5ldyBEb2N1bWVudEZyYWdtZW50KClcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGl2ID0gZnJhZ21lbnQuY3JlYXRlRWwoJ2RpdicpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNlcXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZSA9PiBlLm5hbWUgKyAnIC0gJyArIChlLmRlc2MgfHwgJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGZyYWdtZW50LmNyZWF0ZUVsKCdkaXYnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLnNldFRleHQoZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAwLjVyZW07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmctYm90dG9tOiAwLjVyZW07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGVsKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChkaXYpXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZyYWdtZW50XG4gICAgICAgICAgICAgICAgfSkoKVxuICAgICAgICAgICAgKVxuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJGaWxlVmlldyIsIk1hcmtkb3du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Q0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDaEgsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0QsUUFBUSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ25HLFFBQVEsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ3RHLFFBQVEsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ3RILFFBQVEsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlFLEtBQUssQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUNEO0FBQ08sU0FBUyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckgsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxNQUFNLEtBQUssVUFBVSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3SixJQUFJLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU8sVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3RFLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRSxFQUFFO0FBQ3RCLFFBQVEsSUFBSSxDQUFDLEVBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ3RFLFFBQVEsT0FBTyxDQUFDLEVBQUUsSUFBSTtBQUN0QixZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pLLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwRCxZQUFZLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6QixnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTTtBQUM5QyxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3hFLGdCQUFnQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO0FBQ2pFLGdCQUFnQixLQUFLLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxTQUFTO0FBQ2pFLGdCQUFnQjtBQUNoQixvQkFBb0IsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNoSSxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUMxRyxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ3pGLG9CQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDdkYsb0JBQW9CLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMs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
