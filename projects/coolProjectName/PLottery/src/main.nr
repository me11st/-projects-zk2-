mod libs;
mod types;

use dep::aztec::macros::aztec;

#[aztec]
pub contract NFT {
    use crate::types::nft_note::{NFTNote, PartialNFTNote};
    use dep::authwit::auth::{
        assert_current_call_valid_authwit, assert_current_call_valid_authwit_public,
        compute_authwit_nullifier,
    };
    use dep::aztec::{
        macros::{
            events::event,
            functions::{initializer, internal, private, public, utility, view},
            storage::storage,
        },
        messages::logs::note::encode_and_encrypt_note,
        note::{constants::MAX_NOTES_PER_PAGE, note_interface::NoteProperties},
        prelude::{
            AztecAddress, Map, NoteGetterOptions, NoteViewerOptions, PrivateContext, PrivateSet,
            PublicContext, PublicImmutable, PublicMutable,
        },
        protocol_types::traits::Serialize,
        utils::comparison::Comparator,
    };
    use dep::compressed_string::FieldCompressedString;
    use aztec::protocol_types::traits::ToField;
    use std::meta::derive;

    #[storage]
    struct Storage<Context> {
        // The symbol of the NFT
        symbol: PublicImmutable<FieldCompressedString, Context>,
        // The name of the NFT
        name: PublicImmutable<FieldCompressedString, Context>,
        // The admin of the contract
        admin: PublicMutable<AztecAddress, Context>,
        // Addresses that can mint
        minters: Map<AztecAddress, PublicMutable<bool, Context>, Context>,
        // Contains the NFTs owned by each address in private.
        private_nfts: Map<AztecAddress, PrivateSet<NFTNote, Context>, Context>,
        // A map from token ID to a boolean indicating if the NFT exists.
        nft_exists: Map<Field, PublicMutable<bool, Context>, Context>,
        // A map from token ID to the public owner of the NFT.
        public_owners: Map<Field, PublicMutable<AztecAddress, Context>, Context>,
    }

    /// A private note representing a token id associated to an account.
    #[custom_note]
    #[derive(Eq, Serialize)]
    pub struct NFTNote {
        // The ordering of these fields is important given that it must:
        //   a) match that of NFTPartialNotePrivateContent, and
        //   b) have the public field at the end
        // Correct ordering is checked by the tests in this module.

        /// The owner of the note, i.e. the account whose nullifier secret key is required to compute the nullifier.
        owner: AztecAddress,
        /// Random value, protects against note hash preimage attacks.
        randomness: Field,
        /// The ID of the token represented by this note.
        token_id: Field,
    }

}
