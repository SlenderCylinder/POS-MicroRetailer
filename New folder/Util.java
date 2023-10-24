package com.shagar123.microretailer;

import android.content.Context;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Util {
    final public static String TAG = "PX-PRTag";

    public static void info(String msg) {
        Log.i(TAG, msg);
    }

    public static void debug(String msg) {
        Log.d(TAG, msg);
    }

    public static void error(String msg) {
        Log.e(TAG, msg);
    }

    public static String readAssets(Context context, String fileName) {
        BufferedReader reader = null;
        StringBuilder builder = new StringBuilder();
        try {
            reader = new BufferedReader(
                    new InputStreamReader(context.getAssets().open(fileName)));

            // do reading, usually loop until end of file reading
            String mLine;
            while ((mLine = reader.readLine()) != null) {
                builder.append(mLine);
                builder.append("\n");
            }
        } catch (IOException e) {
            //log the exception
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    //log the exception
                }
            }
        }
        return builder.toString();
    }
}
