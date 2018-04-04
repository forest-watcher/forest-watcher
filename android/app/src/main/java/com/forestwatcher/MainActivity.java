package com.forestwatcher;

import android.widget.LinearLayout;
import android.graphics.Color;
import android.widget.TextView;
import android.view.Gravity;

import com.reactnativenavigation.controllers.SplashActivity;

import android.content.Intent;

public class MainActivity extends SplashActivity {

    @Override
    public LinearLayout createSplashLayout() {
        LinearLayout view = new LinearLayout(this);
        TextView textView = new TextView(this);

        view.setBackgroundColor(Color.parseColor("#97be32"));
        view.setGravity(Gravity.CENTER);

        view.addView(textView);
        return view;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
}
