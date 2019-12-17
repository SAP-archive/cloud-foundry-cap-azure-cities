sap.ui.define([
  'jquery.sap.global',
  'sap/m/MessageToast',
  'sap/ui/core/mvc/ControllerExtension',
  'sap/ui/core/mvc/OverrideExecution'
], function (jQuery, MessageToast, ControllerExtension, OverrideExecution) {
  return ControllerExtension.extend('CityExplorer.extensions.controllerExtensions.myControllerExtension', {

    metadata: {
      methods: {
        handleUploadComplete: {
          'public': true,
          'final': false,
          'overrideExecution': OverrideExecution.Instead
        },
        handleUploadPress: {
          'public': true,
          'final': false,
          'overrideExecution': OverrideExecution.Instead
        },
        handleTypeMissmatch: {
          'public': true,
          'final': false,
          'overrideExecution': OverrideExecution.Instead
        }
      }
    },

    handleUploadComplete: oEvent => {
      const fileUploader = oEvent.getSource();
      const resourceBundle = fileUploader.getModel('i18n').getResourceBundle();
      const statusCode = oEvent.getParameter('status');
      const response = oEvent.getParameter('responseRaw');
      fileUploader.clear();
      if (statusCode === 200) {
        const bindingContext = fileUploader.getBindingContext();
        bindingContext.setProperty('ImageUrl', response)
        MessageToast.show(resourceBundle.getText('extension-uploader-success'));
      } else {
        MessageToast.show(resourceBundle.getText('extension-uploader-failure').replace('$1', response));
      }
    },

    handleUploadPress: oEvent => {
      const button = oEvent.getSource();
      const resourceBundle = button.getModel('i18n').getResourceBundle();
      const fileUploader = button.getParent().getItems()[1];
      if (!fileUploader.getValue()) {
        MessageToast.show(resourceBundle.getText('extension-uploader-missingFile'));
        return;
      }
      fileUploader.upload();
    },

    handleTypeMissmatch: oEvent => {
      const fileUploader = oEvent.getSource();
      const resourceBundle = fileUploader.getModel('i18n').getResourceBundle();
      MessageToast.show(resourceBundle.getText('extension-uploader-typeMismatch'));
    }
  });
});
