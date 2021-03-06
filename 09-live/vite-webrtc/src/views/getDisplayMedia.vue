<template>
  <div class="mediaDevices">
    <div style="display: flex">
      <video autoplay playsinline ref="refVideoPlay"></video>

      <video playsinline ref="refRecplayer"></video>
    </div>
    <br />
    <a-space size="large">
      <a-button type="primary" @click="handleOutput"> output </a-button>
      <a-button type="primary" @click="handleRecord">
        {{ recordStatus ? "Start" : "Stop" }} Record
      </a-button>
      <a-button type="primary" :disabled="!recordStatus" @click="handlePlay">
        play
      </a-button>
      <a-button
        type="primary"
        :disabled="!recordStatus"
        @click="handleDownload"
      >
        Download
      </a-button>
    </a-space>
    <br />
    <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 8 }">
      <a-form-item
        v-for="(value, key, index) in MediaStreamAPI"
        :key="index"
        :label="key"
      >
        {{ value }}
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import adapter from "webrtc-adapter";

interface Constraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export default defineComponent({
  name: "getDisplayMedia",
  setup() {
    const refVideoPlay = ref<HTMLVideoElement | null>(null);
    const refRecplayer = ref<HTMLVideoElement | null>(null);
    const recordStatus = ref<boolean>(true);
    const MediaStreamAPI = ref<object>({});

    let stream: any;
    let mediaRecorder: any = null;
    const buffer: any[] = [];

    // mounted -> onMounted
    onMounted(async () => {
      console.log(adapter);
      console.log(adapter.browserDetails.browser);

      if (
        !navigator.mediaDevices ||
        !(navigator.mediaDevices as any).getDisplayMedia
      ) {
        console.log("getDisplayMedia is not supported!");
      } else {
        const constraints: Constraints = {
          video: true,
          audio: false,
        };
        try {
          stream = await (navigator.mediaDevices as any).getDisplayMedia(
            constraints
          );
          (refVideoPlay.value as HTMLVideoElement).srcObject = stream;

          const videoTrack = stream.getVideoTracks();
          MediaStreamAPI.value = videoTrack[0].getSettings();

          // 标签设置 autoplay 自动播放，但是注意兼容
          // 更多设置请转移查看: https://www.yuque.com/wuchendi/fe/gflcap
          // (refVideoPlay.value as HTMLVideoElement).onloadedmetadata = async () => {
          //   await (refVideoPlay.value as HTMLVideoElement).play();
          // };
        } catch (err) {
          console.log(`getDisplayMedia error: ${err}`);
        }
      }
    });

    function handleDataAvailable(e: { data: { size: number } }) {
      if (e?.data?.size > 0) {
        buffer.push(e.data);
      }
    }
    const handleOutput = () => {};

    const handleRecord = () => {
      if (recordStatus.value) {
        const mineType = "video/webm;codecs=vp8";
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!MediaRecorder.isTypeSupported(mineType)) {
          console.error(`${mineType} is not supported!`);
          return;
        }
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          mediaRecorder = new MediaRecorder(stream, {
            mineType: "video/webm;codecs=vp8",
          });
          mediaRecorder.ondataavailable = handleDataAvailable;
          mediaRecorder.start(10);
        } catch (error) {
          console.error(`Failed to create MediaRecorder: ${error}`);
        }
      } else {
        console.log(mediaRecorder);

        mediaRecorder.stop();
      }
      recordStatus.value = !recordStatus.value;
    };

    const handlePlay = () => {
      const blob = new Blob(buffer, { type: "video/webm" });
      (refRecplayer.value as HTMLVideoElement).src = window.URL.createObjectURL(
        blob
      );
      (refRecplayer.value as HTMLVideoElement).srcObject = null;
      (refRecplayer.value as HTMLVideoElement).controls = true;
      (refRecplayer.value as HTMLVideoElement).play();
    };

    const handleDownload = () => {
      const blob = new Blob(buffer, { type: "video/webm" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.style.display = "none";
      a.download = `cd-${+new Date()}.webm`;
      a.click();
    };

    return {
      refVideoPlay,
      refRecplayer,
      recordStatus,
      MediaStreamAPI,
      handleOutput,
      handleRecord,
      handlePlay,
      handleDownload,
    };
  },
});
</script>
