/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */

/**
 * Generated using theia-extension-generator
 */

import { KeymanVancouverCommandContribution, KeymanVancouverMenuContribution } from './keyman-vancouver-contribution';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { ContainerModule } from '@theia/core/shared/inversify';
import { KeymanVancouverGettingStarted } from './keyman-vancouver-widget';
import { WidgetFactory } from '@theia/core/lib/browser';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';


import '../../src/browser/style/vancouver.css';

export default new ContainerModule(bind => {
    // add your contribution bindings here
    bind(CommandContribution).to(KeymanVancouverCommandContribution);
    bind(MenuContribution).to(KeymanVancouverMenuContribution);

    bind(KeymanVancouverGettingStarted).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: GettingStartedWidget.ID,
        createWidget: async () => ctx.container.get<KeymanVancouverGettingStarted>(KeymanVancouverGettingStarted)
    })).inSingletonScope();


});
