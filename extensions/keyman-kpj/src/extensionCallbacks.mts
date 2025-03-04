/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */


/**
 * Code related to Extension support for callbacks
 */

import { CompilerCallbackOptions, CompilerCallbacks, CompilerError, CompilerErrorNamespace, CompilerErrorSeverity, CompilerEvent, CompilerFileCallbacks, CompilerFileSystemCallbacks, compilerLogLevelToSeverity, CompilerPathCallbacks } from "@keymanapp/common-types";
import * as fs from 'node:fs';
import * as path from 'node:path';
import { platform } from 'node:os';
import { KeymanSentry } from "@keymanapp/developer-utils";
import { PackageCompilerMessages } from "@keymanapp/kmc-package";


interface ErrorWithCode {
    code?: string;
}


export class ExtensionCallbacks implements CompilerCallbacks {
    /* from NodeCompilerCallbacks */

    messages: CompilerEvent[] = [];
    messageCount = 0;
    messageFilename: string = '';

    constructor(private options: CompilerCallbackOptions, private msg: (m: string)=>void) {
    }

    clear() {
      this.messages = [];
      this.messageCount = 0;
      this.messageFilename = '';
    }

    /**
     * Returns true if any message in the log is a Fatal, Error, or if we are
     * treating warnings as errors, a Warning. The warning option will be taken
     * from the CompilerOptions passed to the constructor, or the parameter, to
     * allow for per-file overrides (as seen with projects, for example).
     * @param compilerWarningsAsErrors
     * @returns
     */
    hasFailureMessage(compilerWarningsAsErrors?: boolean): boolean {
      return CompilerFileCallbacks.hasFailureMessage(
        this.messages,
        // parameter overrides global option
        false, // compilerWarningsAsErrors ?? this.options.compilerWarningsAsErrors
      );
    }

    hasMessage(code: number): boolean {
      return this.messages.find((item) => item.code == code) === undefined ? false : true;
    }

    private verifyFilenameConsistency(originalFilename: string): void {
      if(fs.existsSync(originalFilename)) {
        // Note, we only check this if the file exists, because
        // if it is not found, that will be returned as an error
        // from loadFile anyway.
        let filename = fs.realpathSync(originalFilename);
        let nativeFilename = fs.realpathSync.native(filename);
        if(platform() == 'win32' && originalFilename.match(/^.:/)) {
          // When an absolute path is passed in, it includes a drive letter.
          // Drive letter case can differ but we don't care about that on win32.
          // Typically absolute paths only appear for input parameters, as absolute
          // paths are flagged as warnings when they appear in source files anyway.
          // Upper casing the drive letter just avoids the issue.
          filename = filename[0].toUpperCase() + filename.substring(1);
          nativeFilename = nativeFilename[0].toUpperCase() + nativeFilename.substring(1);
        }
        if(filename != nativeFilename) {
        //   this.reportMessage(InfrastructureMessages.Hint_FilenameHasDifferingCase({
        //     reference: path.basename(originalFilename),
        //     filename: path.basename(nativeFilename)
        //   }));
        this.reportMessage({
            code: CompilerErrorSeverity.Hint | 0xF000 | 0x0001,
            message: `VANCOUVER: differing case warning`
        });
        }
      }
    }

    /* CompilerCallbacks */

    loadFile(filename: string): Uint8Array {
        //   this.verifyFilenameConsistency(filename);
        try {
            return fs.readFileSync(filename);
        } catch (e) {
            const { code } = e as ErrorWithCode;
            if (code === 'ENOENT') {
                // code smell…
                return (null as unknown) as Uint8Array;
            } else {
                throw e;
            }
        }
    }

    fileSize(filename: string): number {
      return fs.statSync(filename)?.size;
    }

    get path(): CompilerPathCallbacks {
      return path;
    }

    get fs(): CompilerFileSystemCallbacks {
      return fs;
    }

    reportMessage(event: CompilerEvent): void {
      if(!event.filename) {
        event.filename = this.messageFilename;
      }

      if(this.messageFilename != event.filename) {
        // Reset max message limit when a new file is being processed
        this.messageFilename = event.filename;
        this.messageCount = 0;
      }

      const disable = CompilerFileCallbacks.applyMessageOverridesToEvent(event, {} /* this.options.messageOverrides*/);

      this.messages.push({...event});

    //   // report fatal errors to Sentry, but don't abort; note, it won't be
    //   // reported if user has disabled the Sentry setting
    //   if(CompilerError.severity(event.code) == CompilerErrorSeverity.Fatal) {
    //     // this is async so returns a Promise, we'll let it resolve in its own
    //     // time, and it will emit a message to stderr with details at that time
    //     KeymanSentry.reportException(event.exceptionVar ?? event.message, false);
    //   }

    //   if(disable || CompilerError.severity(event.code) < compilerLogLevelToSeverity[this.options.logLevel]) {
    //     // collect messages but don't print to console
    //     return;
    //   }

      // We don't use this.messages.length because we only want to count visible
      // messages, and there's no point in recalculating the total for every
      // message emitted.

      this.messageCount++;
    //   if(this.messageCount > 99/*MaxMessagesDefault*/) {
    //     return;
    //   }

    //   if(this.messageCount == 99/*MaxMessagesDefault*/) {
    //     // We've hit our event limit so we'll suppress further messages, and emit
    //     // our little informational message so users know what's going on. Note
    //     // that this message will not be included in the this.messages array, and
    //     // that will continue to collect all messages; this only affects the
    //     // console emission of messages.
    //     event = InfrastructureMessages.Info_TooManyMessages({count: MaxMessagesDefault});
    //     event.filename = this.messageFilename;
    //   }

      this.printMessage(event);
    }

    private printMessage(event: CompilerEvent) {
      if(this.options.logFormat == 'tsv') {
        this.printTsvMessage(event);
      } else {
        this.printFormattedMessage(event);
      }
    }

    private printTsvMessage(event: CompilerEvent) {
        this.msg([
        CompilerError.formatFilename(event.filename || '<file>', {fullPath:true, forwardSlashes:false}),
        CompilerError.formatLine(event.line || -1),
        CompilerError.formatSeverity(event.code),
        CompilerError.formatCode(event.code),
        CompilerError.formatMessage(event.message)
      ].join('\t') + '\n');
    }

    private printFormattedMessage(event: CompilerEvent) {
    //   const severityColor = severityColors[CompilerError.severity(event.code)] ?? color.reset;
    //   const messageColor = this.messageSpecialColor(event) ?? color.reset;
      this.msg(
        (
          event.filename
          ? CompilerError.formatFilename(event.filename) +
            (event.line ? ':' + CompilerError.formatLine(event.line) : '') + ' - '
          : ''
        ) +
        CompilerError.formatSeverity(event.code) + ' ' +
        CompilerError.formatCode(event.code) + ': ' +
        CompilerError.formatMessage(event.message) + '\r\n'
    );

    //   if(event.code == InfrastructureMessages.INFO_ProjectBuiltSuccessfully) {
    //     // Special case: we'll add a blank line after project builds
    //     process.stdout.write('\n');
    //   }
    }

    debug(msg: string) {
      if(this.options.logLevel == 'debug') {
        console.debug(msg);
      }
    }

    fileExists(filename: string) {
      return fs.existsSync(filename);
    }

    resolveFilename(baseFilename: string, filename: string) {
      const basePath =
        baseFilename.endsWith('/') || baseFilename.endsWith('\\') ?
        baseFilename :
        path.dirname(baseFilename);
      // Transform separators to platform separators -- we are agnostic
      // in our use here but path prefers files may use
      // either / or \, although older kps files were always \.
      if(path.sep == '/') {
        filename = filename.replace(/\\/g, '/');
      } else {
        filename = filename.replace(/\//g, '\\');
      }
      if(!path.isAbsolute(filename)) {
        filename = path.resolve(basePath, filename);
      }
      return filename;
    }

  }
