import { readFileSync } from 'fs';
import ora from 'ora'
import { CeramicClient } from '@ceramicnetwork/http-client'
import {
  createComposite,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime,
} from "@composedb/devtools-node";
import { Composite } from "@composedb/devtools";
import { DID } from 'dids';
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";


const spinner = ora();
const ceramic = new CeramicClient("https://ceramic-temp.hirenodes.io/");
const seed = readFileSync('./admin_seed.txt')
  const key = fromString(
    seed,
    "base16"
  );
  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key)
  })
  await did.authenticate()
  ceramic.did = did

  spinner.info("writing composite to Ceramic")

  const profileComposite = await createComposite(
    ceramic,
    "./composites/00-basicProfile.graphql"
  );

  const postsSchema = readFileSync("./composites/01-posts.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", profileComposite.modelIDs[0]);

  const postsComposite = await Composite.create({
    ceramic,
    schema: postsSchema,
  });

  const followingSchema = readFileSync("./composites/02-following.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", profileComposite.modelIDs[0]);

  const followingComposite = await Composite.create({
    ceramic,
    schema: followingSchema,
  });

  const postProfileSchema = readFileSync(
    "./composites/03-posts_profile.graphql",
    {
      encoding: "utf-8",
    }
  )
    .replace("$POSTS_ID", postsComposite.modelIDs[1])
    .replace("$PROFILE_ID", profileComposite.modelIDs[0]);

  const postsProfileComposite = await Composite.create({
    ceramic,
    schema: postProfileSchema,
  });

  const composite = Composite.from([
    profileComposite,
    postsComposite,
    followingComposite,
    postsProfileComposite,
  ]);

  await writeEncodedComposite(composite, "./src/__generated__/definition.json");
  spinner.info('creating composite for runtime usage')
  await writeEncodedCompositeRuntime(
    ceramic,
    "./src/__generated__/definition.json",
    "./src/__generated__/definition.js"
  );
  spinner.info('deploying composite')
  const deployComposite = await readEncodedComposite(ceramic, './src/__generated__/definition.json')

  await deployComposite.startIndexingOn(ceramic)
  spinner.succeed("composite deployed & ready for use");
/**
 * @param {Ora} spinner - to provide progress status.
 * @return {Promise<void>} - return void when composite finishes deploying.
 */
