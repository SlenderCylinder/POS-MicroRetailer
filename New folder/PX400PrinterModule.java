package com.shagar123.microretailer;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import android.graphics.Bitmap;
import android.webkit.WebView;

import com.cloudpos.DeviceException;
import com.cloudpos.POSTerminal;
import com.cloudpos.printer.Format;
import com.cloudpos.printer.PrinterDevice;
import com.wizarpos.htmllibrary.PrinterHtmlListener;
import net.glxn.qrgen.android.QRCode;


public class PX400PrinterModule extends ReactContextBaseJavaModule {
    private PrinterDevice device = null;

    public PX400PrinterModule(ReactApplicationContext reactContext) {
        super(reactContext);

        if (device == null) {
            device = (PrinterDevice) POSTerminal.getInstance(reactContext).getDevice("cloudpos.device.printer");
        }

    }


    @Override
    public String getName() {
        return "PX400PrinterModule";
    }

    @ReactMethod
    public void open() {
        try {
            device.open();
            Util.info("Open Printer succeed!");
        } catch (DeviceException ex) {
            Util.error("Open Printer Failed!");
            ex.printStackTrace();
        }
    }

    @ReactMethod
    public void close() {
        try {
            device.close();
            Util.info("Close Printer succeed!");
        } catch (DeviceException ex) {
            Util.error("Close Printer Failed!");
            ex.printStackTrace();
        }
    }

    /**
     * Print text. Synchronous function.
     * @param msg, text to print
     */
    @ReactMethod
    public void printText(String msg) {
        try {
            Format format = new Format();
            format.setParameter(Format.FORMAT_FONT_SIZE, Format.FORMAT_FONT_SIZE_SMALL);
            device.printText(format, msg);
            Util.info("Print Text succeed!");
        } catch (DeviceException ex) {
            Util.error("Print Text Failed!");
            ex.printStackTrace();
        }
    }

    /**
     * Print data from asset html file.
     * Asynchronous function, the print is not performed immediately.
     *
     * @param filename,                     html file name
     * @param listener,                     callback when the print is finished
     * @param callback
     */
    @ReactMethod
    public void printHtml(String filename, final Callback callback, final Callback listener) {
        try {
            WebView.enableSlowWholeDocumentDraw();
            device.printHTML(getReactApplicationContext(), Util.readAssets(getReactApplicationContext(), filename), new PrinterHtmlListener() {
                @Override
                public void onGet(Bitmap bitmap, int i) {
                    // nothing to do
                }

                @Override
                public void onFinishPrinting(int i) {
                    Util.info("Print Html finished:" + i);
                    listener.invoke();
                    callback.invoke();
                }
            });
        } catch (DeviceException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Print a qr-code containing data. Synchronous function.
     *
     * @param data, qr-code content
     */
    @ReactMethod
    public void printQrCode(String data, final Callback callback) {
        try {
            Bitmap bitmap = QRCode.from(data).bitmap();
            Format format = new Format();
            format.setParameter(Format.FORMAT_ALIGN, Format.FORMAT_ALIGN_CENTER);
            device.printBitmap(format, bitmap);
            Util.info("Print QR Code succeed!");
            callback.invoke(null); // Notify JavaScript that printing was successful
        } catch (DeviceException ex) {
            Util.error("Print QR Code Failed!");
            ex.printStackTrace();
            callback.invoke(ex.getMessage()); // Notify JavaScript of an error
        }
    }
    @ReactMethod
    public void endPrint() {
        try {
            device.printText("\n\n\n");
        } catch (DeviceException ex) {
            ex.printStackTrace();
        }    }
}
