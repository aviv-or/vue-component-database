<template>
  <mu-dialog
    :open="show"
    :title="dialogTitle"
    v-on:close="onClose"
  >
    <p>
      Please consider:
      <ul>
        <li>Currently only ES2015 code is supported.</li>
        <li>Components can not have childComponents yet.</li>
      </ul>
    </p>
    <form>
      <mu-text-field
        label="Title"
        v-model="title"
        fullWidth
      />
      <mu-text-field
        label="Description"
        v-model="description"
        fullWidth
      />
      <mu-raised-button
        v-if="isUploadMode"
        label="Choose Single File Component (.vue)"
      >
        <input
          type="file"
          class="file-button"
          accept=".vue"
          @change="onSelectFile"
        >
      </mu-raised-button>
    </form>
    <mu-flat-button
      slot="actions"
      v-on:click="onClose"
      label="Close"
    />
    <mu-flat-button
      slot="actions"
      v-on:click="onCreateClicked"
      label="Create"
    />
  </mu-dialog>
</template>
<script>
  import { stripIndent } from 'common-tags'
  import muDialog from 'muse-ui/src/dialog/dialog.vue'
  import muTextField from 'muse-ui/src/textField/textField.vue'
  import muFlatButton from 'muse-ui/src/flatButton/flatButton.vue'
  import muRaisedButton from 'muse-ui/src/raisedButton/raisedButton.vue'

  const NEW_COMPONENT_TEMPLATE = stripIndent`
    <template>
      <div>Change me!</div>
    </template>
    <scr${``}ipt>
      export default {

      }
    </sc${``}ript>
    <style>

    </style>

  `

  export default {
    components: {
      muDialog,
      muTextField,
      muFlatButton,
      muRaisedButton,
    },
    props: {
      show: {
        type: Boolean,
        required: true,
      },
      onCancel: {
        type: Function,
        required: true,
      },
      onCreate: {
        type: Function,
        required: true,
      },
      isUploadMode: {
        type: Boolean,
        default: false,
      }
    },
    data: () => ({
      file: null,
      fileContents: null,
      title: ``,
      description: ``,
    }),
    methods: {
      onSelectFile(ev) {
        const { files } = ev.target
        if (!files.length) {
          return
        }
        const fileToRead = files[0]
        const fileReader = new FileReader()
        fileReader.onload = () => {
          this.fileContents = fileReader.result
        }
        fileReader.readAsText(fileToRead)
      },
      onCreateClicked() {
        this.onCreate({
          title: this.title,
          description: this.description,
          component: this.fileContents || NEW_COMPONENT_TEMPLATE,
        })
        this.resetData()
      },
      onClose() {
        this.resetData()
        this.onCancel()
      },
      resetData() {
        this.title = ``
        this.description = ``
        this.fileContents = ``
      }
    },
    computed: {
      dialogTitle() {
        return this.isUploadMode ? `Upload new component` : `Create new component`
      },
      isFormInvalid() {
        if (!this.fileContents) {
          return true
        } else if (!this.title) {
          return true
        } else if (!this.description) {
          return true
        }

        return false
      },
    },
  }
</script>
<style>
  .file-button {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0;
  }

  .md-dialog {
    width: 600px;
  }
</style>
