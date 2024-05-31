import React, { Component } from "react";
import Input from "react-toolbox/lib/input";
import { Card, CardText, CardTitle } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";
import { Certificates, Profiles } from "../lib/sdaAPI";
import { initiateDownload } from "../lib/util";
import Dropdown from "react-toolbox/lib/dropdown";

class CertificateGenerator extends Component {
  constructor(props) {
    super(props);
    this.state = { email: "", language: "English" };
  }

  render() {
    const validateEmail = () => {};

    const generateReadableStream = (result) => {
      const reader = result.body.getReader();
      return new ReadableStream({
        start(controller) {
          return pump();
          function pump() {
            return reader.read().then(({ done, value }) => {
              // When no more data needs to be consumed, close the stream
              if (done) {
                controller.close();
                return;
              }
              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);
              return pump();
            });
          }
        },
      });
    };

    const handleSubmit = async () => {
      const { email } = this.state;
      await Profiles.getFromEmail(email).then(async (result) => {
        console.log("Result here: ", result);
        console.log(
          "Profile certificates: ",
          result.profile.profile.profileCertificates
        );
        let { profile } = result.profile;
        let { profileCertificates } = profile;

        profileCertificates = profileCertificates.filter(
          (element) => element.passed
        );

        if (!profileCertificates || profileCertificates.length === 0) {
          alert("No pass certificates present for the profile id");
        } else {
          if (
            window.confirm(
              `Are you sure you want to generate a certificate for profile  id ${email} in ${language} language.`
            )
          ) {
            profileCertificates.sort(function (a, b) {
              var keyA = new Date(a.certDate),
                keyB = new Date(b.certDate);
              // Compare the 2 dates
              if (keyA < keyB) return 1;
              if (keyA > keyB) return -1;
              return 0;
            });
            console.log("Profile certificates sorted: ", profileCertificates);
            const { country, member } = profile;
            const certificateData = profileCertificates[0];
            const { certDate, name, jobTitle, uniqueId } = certificateData;
            const { language } = this.state;
            await Certificates.genCert({
              name,
              jobTitle,
              certDate,
              language,
              country,
              memberId: member || "NA",
              uniqueId,
            })
              .then((result) => generateReadableStream(result))
              .then((stream) => new Response(stream))
              .then((response) => response.blob())
              .then((blob) => URL.createObjectURL(blob))
              .then((url) => initiateDownload("Certificate.png", url));
          }
        }
      });
    };

    const { email, language } = this.state;
    return (
      <Card style={{ width: "640px", minWidth: 350 }}>
        <CardTitle title="Certificate Generator" />
        <CardText>
          Profile Email Id:
          <Input onChange={(email) => this.setState({ email })} value={email} />
          {/* <Dropdown
            value={language}
            allowBlank={false}
            onChange={(value) => this.setState({ language: value })}
            source={[
              { value: "English", label: "English" },
              { value: "Bangladesh - Bangla", label: "Bangladesh - Bangla" },
              { value: "Ethiopia - Amharic", label: "Ethiopia - Amharic" },
              { value: "India - Hindi", label: "India - Hindi" },
            ]}
            required={true}
            label="Language"
          /> */}
          <Button raised label="Generate" onClick={handleSubmit} />
        </CardText>
      </Card>
    );
  }
}
export default CertificateGenerator;
